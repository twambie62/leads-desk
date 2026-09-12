import { PrismaClient } from "@/src/generated/prisma"; // adjust path if yours differs
import { PrismaPg } from "@prisma/adapter-pg";
import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const LEAD_SOURCES = ["FACEBOOK", "WHATSAPP", "REFERRAL", "WEBSITE", "PHYSICAL", "OTHER"] as const;
const BUSINESS_TYPES = ["Retail", "Restaurant", "Salon", "Clinic", "Real Estate", "Import/Export", "Wholesale", "Tech Startup"];
const PRODUCTS = ["POS System", "Inventory Software", "Website Package", "Digital Marketing Bundle", "CRM Setup", "Training Package"];
const LOCATIONS = ["Lilongwe", "Blantyre", "Mzuzu", "Zomba", "Kasungu", "Mangochi", "Salima"];

// Weighted status distribution so it looks like a real pipeline funnel, not evenly split
const STATUS_WEIGHTS: { status: string; weight: number }[] = [
  { status: "NEW_LEAD", weight: 22 },
  { status: "CONTACTED", weight: 18 },
  { status: "QUALIFIED", weight: 14 },
  { status: "MEETING_SCHEDULED", weight: 10 },
  { status: "PROPOSAL_DEMO", weight: 8 },
  { status: "WON", weight: 6 },
  { status: "TRAINING", weight: 5 },
  { status: "CUSTOMER", weight: 7 },
  { status: "DISQUALIFIED", weight: 5 },
  { status: "LOST", weight: 3 },
  { status: "NO_RESPONSE", weight: 2 },
];

function weightedStatus(): string {
  const total = STATUS_WEIGHTS.reduce((s, r) => s + r.weight, 0);
  let roll = Math.random() * total;
  for (const row of STATUS_WEIGHTS) {
    if (roll < row.weight) return row.status;
    roll -= row.weight;
  }
  return "NEW_LEAD";
}

function randomPastDate(daysBack: number): Date {
  return faker.date.recent({ days: daysBack });
}

async function main() {
  console.log("Seeding dummy data...");

  // ── Admin (upsert so this is safe to re-run alongside your real seed) ──
  const admin = await prisma.user.upsert({
    where: { email: "admin@leadsdesk.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@leadsdesk.com",
      passwordHash: await bcrypt.hash("Admin@2026", 10),
      role: "ADMIN",
    },
  });

  // ── Sales agents ──
  const agentPasswordHash = await bcrypt.hash("Agent@2026", 10);
  const agentNames = [
    "Chisomo Banda", "Thandiwe Phiri", "Lusungu Mvula", "Blessings Chirwa",
    "Grace Nyirenda", "Emmanuel Kachale", "Precious Zulu", "James Mwale",
  ];

  const agents = [];
  for (const [i, name] of agentNames.entries()) {
    const agent = await prisma.user.upsert({
      where: { email: `agent${i + 1}@leadsdesk.com` },
      update: {},
      create: {
        name,
        email: `agent${i + 1}@leadsdesk.com`,
        passwordHash: agentPasswordHash,
        role: "SALES_AGENT",
      },
    });
    agents.push(agent);
  }
  console.log(`Created/verified ${agents.length} sales agents (password for all: Agent@2026)`);

  // ── One trainer ──
  const trainer = await prisma.user.upsert({
    where: { email: "trainer@leadsdesk.com" },
    update: {},
    create: {
      name: "Patricia Mbewe",
      email: "trainer@leadsdesk.com",
      passwordHash: await bcrypt.hash("Trainer@2026", 10),
      role: "TRAINER",
    },
  });

  // ── Leads ──
  const LEAD_COUNT = 180;
  console.log(`Creating ${LEAD_COUNT} leads...`);

  for (let i = 0; i < LEAD_COUNT; i++) {
    const status = weightedStatus();
    const createdAt = randomPastDate(180); // spread across last 6 months
    const source = faker.helpers.arrayElement(LEAD_SOURCES);
    const assignedAgent = faker.helpers.arrayElement(agents);
    const isUnassigned = Math.random() < 0.08; // ~8% unassigned, for testing that state

    const isDisqualified = status === "DISQUALIFIED";
    const isLost = status === "LOST";
    const isQualifiedOrBeyond = ["QUALIFIED", "MEETING_SCHEDULED", "PROPOSAL_DEMO", "WON", "TRAINING", "CUSTOMER"].includes(status);

    const lead = await prisma.lead.create({
      data: {
        leadName: faker.person.fullName(),
        businessName: Math.random() < 0.85 ? faker.company.name() : null,
        phoneNumber: `+265${faker.string.numeric(9)}`,
        whatsappNumber: Math.random() < 0.7 ? `+265${faker.string.numeric(9)}` : null,
        email: Math.random() < 0.6 ? faker.internet.email().toLowerCase() : null,
        location: faker.helpers.arrayElement(LOCATIONS),
        businessType: faker.helpers.arrayElement(BUSINESS_TYPES),
        productInterested: faker.helpers.arrayElement(PRODUCTS),
        source,
        status: status as any,
        assignedAgentId: isUnassigned ? null : assignedAgent.id,
        createdById: Math.random() < 0.3 ? admin.id : assignedAgent.id,
        qualificationNote: isQualifiedOrBeyond ? faker.lorem.sentence() : null,
        disqualifiedReason: isDisqualified || isLost
          ? faker.helpers.arrayElement([
            "Budget too low for our packages",
            "Already using a competitor's solution",
            "Not the right decision maker",
            "No longer interested",
            "Unresponsive after multiple attempts",
          ])
          : null,
        createdAt,
        updatedAt: createdAt,
      },
    });

    // ── Audit log: creation event ──
    await prisma.auditLog.create({
      data: {
        action: "CREATED",
        message: `${assignedAgent.name} created lead "${lead.leadName}"`,
        userId: lead.createdById,
        leadId: lead.id,
        createdAt,
      },
    });

    // ── Audit log: status change, if not still NEW_LEAD ──
    if (status !== "NEW_LEAD") {
      await prisma.auditLog.create({
        data: {
          action: "STATUS_CHANGED",
          message: `Status changed from NEW_LEAD to ${status}`,
          userId: assignedAgent.id,
          leadId: lead.id,
          metadata: { from: "NEW_LEAD", to: status },
          createdAt: faker.date.between({ from: createdAt, to: new Date() }),
        },
      });
    }

    // ── Activities for anything past NEW_LEAD ──
    if (status !== "NEW_LEAD" && !isUnassigned) {
      const activityCount = faker.number.int({ min: 1, max: 4 });
      for (let a = 0; a < activityCount; a++) {
        const activityDate = faker.date.between({ from: createdAt, to: new Date() });
        const hasFollowUp = Math.random() < 0.5;
        await prisma.leadActivity.create({
          data: {
            leadId: lead.id,
            agentId: assignedAgent.id,
            activityType: faker.helpers.arrayElement([
              "PHONE_CALL", "WHATSAPP", "GOOGLE_MEET", "PHYSICAL_MEETING", "DEMO", "FOLLOW_UP",
            ]),
            activityDate,
            notes: faker.lorem.sentence(),
            // Mix of past, today, and future follow-ups so "Today's Follow-ups" / overdue logic is testable
            nextFollowUpDate: hasFollowUp
              ? faker.helpers.arrayElement([
                faker.date.recent({ days: 5 }),          // overdue
                new Date(),                              // due today
                faker.date.soon({ days: 7 }),            // upcoming
              ])
              : null,
          },
        });
      }
    }

    // ── Sale + Training for anything WON or beyond ──
    if (["WON", "TRAINING", "CUSTOMER"].includes(status)) {
      const saleDate = faker.date.between({ from: createdAt, to: new Date() });
      const amount = faker.number.int({ min: 50000, max: 2500000 }); // MWK-ish range

      const sale = await prisma.sale.create({
        data: {
          leadId: lead.id,
          customerName: lead.businessName ?? lead.leadName,
          productPurchased: lead.productInterested ?? faker.helpers.arrayElement(PRODUCTS),
          package: faker.helpers.arrayElement(["Basic", "Standard", "Premium"]),
          amount,
          paymentStatus: faker.helpers.arrayElement(["PENDING", "PARTIAL", "PAID"]),
          saleDate,
          salesAgentId: assignedAgent.id,
          expectedTrainingDate: faker.date.soon({ days: 14, refDate: saleDate }),
        },
      });

      if (["TRAINING", "CUSTOMER"].includes(status)) {
        await prisma.training.create({
          data: {
            saleId: sale.id,
            trainerId: trainer.id,
            trainingDate: faker.date.between({ from: saleDate, to: new Date() }),
            status: status === "CUSTOMER" ? "COMPLETED" : faker.helpers.arrayElement(["PENDING", "SCHEDULED"]),
            notes: faker.lorem.sentence(),
          },
        });
      }
    }

    if (i % 30 === 0) console.log(`  ...${i}/${LEAD_COUNT} leads created`);
  }

  // ── A handful of login audit logs for realism ──
  for (const agent of agents.slice(0, 4)) {
    await prisma.auditLog.create({
      data: {
        action: "LOGIN",
        message: `${agent.name} logged in`,
        userId: agent.id,
        createdAt: faker.date.recent({ days: 3 }),
      },
    });
  }

  console.log("✅ Dummy data seed complete.");
  console.log(`   Admin:   admin@leadsdesk.com / Admin@2026`);
  console.log(`   Agents:  agent1@leadsdesk.com ... agent8@leadsdesk.com / Agent@2026`);
  console.log(`   Trainer: trainer@leadsdesk.com / Trainer@2026`);
}

main()
  .catch((e) => {
    console.error("Dummy seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });