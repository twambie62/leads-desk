"use client";

import { useEffect, useState } from "react";

export function Greeting({ name }: { name: string }) {
  const [greeting, setGreeting] = useState("Hello");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  return (
    <div>
      <p className="text-xs text-muted-foreground">{greeting} 👋</p>
      <h1 className="text-lg font-semibold leading-tight">{name}</h1>
    </div>
  );
}