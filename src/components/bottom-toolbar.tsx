
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, ShoppingCart, User as UserIcon } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { cn } from "@/lib/utils";
import type { User } from "@/lib/types";
import { useEffect, useState } from "react";

interface BottomToolbarProps {
  user: User | null;
}

export function BottomToolbar({ user }: BottomToolbarProps) {
  const pathname = usePathname();
  const { cartCount, setIsCartOpen } = useCart();
  const isCustomer = !user || user.role === 'customer';
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/categories", label: "Categories", icon: LayoutGrid },
  ];
  
  const accountItem = {
      href: user ? "/account" : "/login", 
      label: user ? "Account" : "Login", 
      icon: UserIcon 
  };
  
  const isActive = (href: string) => {
      if (href === '/') return pathname === href;
      // For /categories, it should be active for /categories and /categories/[slug]
      return pathname.startsWith(href);
  };
  
  // Custom active check for account link to avoid conflict with home
  const isAccountActive = () => {
      if (user) return pathname.startsWith('/account');
      return pathname === '/login' || pathname.startsWith('/register');
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t border-border">
      <div className="flex justify-around h-full items-center">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "inline-flex flex-1 flex-col items-center justify-center px-2 hover:bg-muted group h-full",
              isActive(item.href) ? "text-primary" : "text-muted-foreground"
            )}
          >
            <item.icon className="w-5 h-5 mb-1" />
            <span className="text-xs">{item.label}</span>
          </Link>
        ))}

        
        {isCustomer && (
          <button
            onClick={() => setIsCartOpen(true)}
            className="inline-flex flex-1 flex-col items-center justify-center px-2 hover:bg-muted group text-muted-foreground relative h-full"
          >
            <ShoppingCart className="w-5 h-5 mb-1" />
            <span className="text-xs">Cart</span>
            {isMounted && cartCount > 0 && (
              <span className="absolute top-2 right-1/2 translate-x-[18px] flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                {cartCount}
              </span>
            )}
          </button>
        )}
        

        <Link
          href={accountItem.href}
          className={cn(
            "inline-flex flex-1 flex-col items-center justify-center px-2 hover:bg-muted group h-full",
            isAccountActive() ? "text-primary" : "text-muted-foreground"
          )}
        >
          <accountItem.icon className="w-5 h-5 mb-1" />
          <span className="text-xs">{accountItem.label}</span>
        </Link>
      </div>
    </div>
  );
}
