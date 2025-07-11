"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ModeToggle } from "../darkmode/mode-button";

export default function Header() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <header className="fixed top-0 left-0 w-full h-16 border-b bg-background/95 backdrop-blur z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-full">
        <Link href="/" className="text-xl font-semibold tracking-wide">
          CentralContactPlus
        </Link>
        {/* Add any right-side nav or theme toggle here */}
        <ModeToggle />
      </div>
    </header>
  );
}
