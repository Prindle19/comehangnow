
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package2, Home, Users, Settings, LogOut, User } from "lucide-react";
import { cn, getFirstName } from "@/lib/utils";
import { Button } from "./ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";

const navLinks = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/family", label: "Family", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Header() {
  const pathname = usePathname();
  const { user, signOut, familyMember, clubSettings } = useAuth();
  
  const userAvatarUrl = familyMember?.avatarUrl || user?.photoURL;
  const userAvatarSrc = userAvatarUrl && !userAvatarUrl.includes('placehold.co') ? userAvatarUrl : undefined;
  const userName = user?.displayName || familyMember?.name || "";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
                <AvatarImage src={clubSettings.logoUrl} alt={clubSettings.name} />
                <AvatarFallback>
                    <Package2 className="h-5 w-5" />
                </AvatarFallback>
            </Avatar>
            <span className="font-bold text-lg font-headline">{clubSettings.name}</span>
          </Link>
          {user && (
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
          )}
        </div>
        
        <div>
          {user ? (
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={userAvatarSrc} alt={userName} />
                    <AvatarFallback className="text-xs">
                        {userName ? getFirstName(userName) : <User />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userName}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/family"><Users className="mr-2 h-4 w-4" />My Family</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/settings"><Settings className="mr-2 h-4 w-4" />Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
