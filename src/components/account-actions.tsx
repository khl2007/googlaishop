
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, CreditCard, LogOut, MapPin, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { getCsrfToken } from "@/lib/csrf";

export function AccountActions() {
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    const res = await fetch("/api/auth/logout", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': getCsrfToken(),
      },
    });

    if (res.ok) {
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
      window.location.href = '/login'; // Full page reload
    } else {
      toast({ title: "Error", description: "Failed to log out.", variant: "destructive" });
    }
  };

  const menuItems = [
    {
      href: "/account/addresses",
      label: "My Addresses",
      icon: MapPin,
    },
    {
      href: "#",
      label: "Payment Methods",
      icon: CreditCard,
      disabled: true,
    },
    {
      href: "#",
      label: "Settings",
      icon: Settings,
      disabled: true,
    },
  ];

  return (
    <div className="divide-y divide-border">
      {menuItems.map((item) => (
        <Link
          key={item.label}
          href={item.disabled ? "#" : item.href}
          className={cn(
            "flex items-center justify-between p-4 -mx-4 md:-mx-6 hover:bg-muted/50 transition-colors",
            item.disabled && "opacity-50 cursor-not-allowed"
          )}
          aria-disabled={item.disabled}
          onClick={(e) => {
            if (item.disabled) e.preventDefault();
          }}
        >
          <div className="flex items-center gap-4">
            <item.icon className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">{item.label}</span>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </Link>
      ))}
      <button
        onClick={handleLogout}
        className="flex w-full items-center justify-between p-4 -mx-4 text-left md:-mx-6 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-4 text-destructive">
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Logout</span>
        </div>
      </button>
    </div>
  );
}
