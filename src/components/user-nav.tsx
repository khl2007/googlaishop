
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { User } from "@/lib/types";
import { cn } from "@/lib/utils";

interface UserNavProps {
  user: User;
  scrolled: boolean;
}

export function UserNav({ user, scrolled }: UserNavProps) {
  const router = useRouter();

  const handleLogout = async () => {
    const res = await fetch("/api/auth/logout", {
      method: "POST",
    });

    if (res.ok) {
      window.location.href = '/login';
    }
  };

  const isCustomer = user.role === 'customer';
  const dashboardLink = isCustomer ? '/account' : `/${user.role}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={cn("relative h-8 w-8 rounded-full", !scrolled && "hover:bg-white/10")}>
          <Avatar className="h-9 w-9">
            <AvatarFallback className={cn(!scrolled && "text-primary-foreground bg-primary-foreground/20")}>
              {user.fullName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-base font-medium leading-none md:text-lg">{user.fullName}</p>
            <p className="text-sm leading-none text-muted-foreground md:text-base">
              {user.username}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild className="text-base md:text-lg">
            <Link href={dashboardLink}>Dashboard</Link>
          </DropdownMenuItem>
          {!isCustomer && (
            <DropdownMenuItem asChild className="text-base md:text-lg">
              <Link href="/account">My Account</Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem disabled className="text-base md:text-lg">Settings</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-base md:text-lg">
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
