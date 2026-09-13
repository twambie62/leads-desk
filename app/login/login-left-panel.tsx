import Image from "next/image";

export function LoginLeftPanel({ variant }: { variant: "text" | "image" }) {
  if (variant === "image") {
    return (
      <div className="relative hidden  bg-[url('/login_background.png')] h-full w-full overflow-hidden rounded-2xl bg-linear-to-br from-primary/10 via-primary/5 to-transparent lg:block">
        {/* Dashboard preview image — anchored bottom-left, not filling the whole panel */}
        <div className="absolute bottom-0 right-0 h-[80%] w-[70%] overflow-hidden rounded-tl-2xl shadow-2xl ring-1 ring-black/5">
          <Image
            src="/dashboard-preview.png"
            alt="LeadsDesk dashboard preview"
            fill
            className="object-cover object-top-left"
            priority
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative hidden h-full bg-[url('/login_background_2.png')] w-full flex-col justify-between overflow-hidden rounded-2xl  p-8 text-white lg:flex">
      <Image src="/logo_2.svg" alt="LeadsDesk logo" width={34} height={34} className="rounded" />

      <div>
        <p className="text-sm text-white/80">Everything in one place</p>
        <h2 className="mt-1 text-2xl font-semibold leading-snug">
          Track every lead from first contact to closed deal, all in one place.
        </h2>
      </div>
    </div>
  );
}