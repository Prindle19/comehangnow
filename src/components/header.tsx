"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package2, Home, Users, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

const navLinks = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/family", label: "Family", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <Package2 className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg font-headline">ClubConnect</span>
          </Link>
          <nav className="hidden items-center gap-4 text-sm md:flex">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                className={cn(
                  "flex items-center gap-2 transition-colors hover:text-foreground",
                  pathname === href ? "text-foreground font-semibold" : "text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
        </div>
        
        {/* Mobile Nav could go here */}
      </div>
    </header>
  );
}
