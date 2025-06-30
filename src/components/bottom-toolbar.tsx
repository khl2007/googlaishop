
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/hooks/use-cart";
import { cn } from "@/lib/utils";
import type { User } from "@/lib/types";
import { useEffect, useState } from "react";

// New colorful and curvy icon components
const HomeIcon = ({ isActive }: { isActive: boolean }) => (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" className="w-6 h-6 mb-1 transition-transform duration-200 group-hover:scale-110">
        <path d="M11.9992 2.50002L2.74922 9.47952V21.5001H9.74922V14.5001H14.2492V21.5001H21.2492V9.47952L11.9992 2.50002Z" fill={isActive ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'} opacity={isActive ? 1 : 0.7} />
    </svg>
);

const CategoriesIcon = ({ isActive }: { isActive: boolean }) => (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" className="w-6 h-6 mb-1 transition-transform duration-200 group-hover:scale-110">
        <path fillRule="evenodd" clipRule="evenodd" d="M10 3H4C3.44772 3 3 3.44772 3 4V10C3 10.5523 3.44772 11 4 11H10C10.5523 11 11 10.5523 11 10V4C11 3.44772 10.5523 3 10 3Z" fill={isActive ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'} opacity={isActive ? 1 : 0.3}/>
        <path fillRule="evenodd" clipRule="evenodd" d="M10 13H4C3.44772 13 3 13.4477 3 14V20C3 20.5523 3.44772 21 4 21H10C10.5523 21 11 20.5523 11 20V14C11 13.4477 10.5523 13 10 13Z" fill={isActive ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'} opacity={isActive ? 1 : 0.6}/>
        <path fillRule="evenodd" clipRule="evenodd" d="M20 3H14C13.4477 3 13 3.44772 13 4V10C13 10.5523 13.4477 11 14 11H20C20.5523 11 21 10.5523 21 10V4C21 3.44772 20.5523 3 20 3Z" fill={isActive ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'} opacity={isActive ? 1 : 0.6}/>
        <path fillRule="evenodd" clipRule="evenodd" d="M20 13H14C13.4477 13 13 13.4477 13 14V20C13 20.5523 13.4477 21 14 21H20C20.5523 21 21 20.5523 21 20V14C21 13.4477 20.5523 13 20 13Z" fill={isActive ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'} opacity={isActive ? 1 : 1}/>
    </svg>
);

const CartIcon = () => (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" className="w-6 h-6 mb-1 text-muted-foreground transition-colors duration-200 group-hover:text-primary">
        <path fillRule="evenodd" clipRule="evenodd" d="M5.79448 8H18.2055C18.2055 8 18.9951 10.155 19.5 11C20.0049 11.845 19.9951 17.845 19.5 18.5C18.9951 19.155 18.2055 21 18.2055 21H5.79448C5.79448 21 5.00488 19.155 4.5 18.5C3.99512 17.845 4.00488 11.845 4.5 11C5.00488 10.155 5.79448 8 5.79448 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 11V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const UserIcon = ({ isActive }: { isActive: boolean }) => (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" className="w-6 h-6 mb-1 transition-transform duration-200 group-hover:scale-110">
        <path d="M12 12C14.4853 12 16.5 9.98528 16.5 7.5C16.5 5.01472 14.4853 3 12 3C9.51472 3 7.5 5.01472 7.5 7.5C7.5 9.98528 9.51472 12 12 12Z" fill={isActive ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'} opacity={isActive ? 1 : 0.3}/>
        <path d="M20.5714 21C20.5714 17.636 16.7143 15 12 15C7.28571 15 3.42857 17.636 3.42857 21" fill={isActive ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'} opacity={isActive ? 1 : 0.7}/>
    </svg>
);

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
    { href: "/", label: "Home", icon: HomeIcon },
    { href: "/categories", label: "Categories", icon: CategoriesIcon },
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
    <div className="md:hidden fixed bottom-0 left-0 z-50 w-full bg-background border-t border-border pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around h-16 items-center">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "inline-flex flex-1 flex-col items-center justify-center px-2 hover:bg-muted group h-full",
              isActive(item.href) ? "text-primary" : "text-muted-foreground"
            )}
          >
            <item.icon isActive={isActive(item.href)} />
            <span className="text-xs">{item.label}</span>
          </Link>
        ))}

        
        {isCustomer && (
          <button
            onClick={() => setIsCartOpen(true)}
            className="inline-flex flex-1 flex-col items-center justify-center px-2 hover:bg-muted group text-muted-foreground relative h-full"
          >
            <CartIcon />
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
          <accountItem.icon isActive={isAccountActive()} />
          <span className="text-xs">{accountItem.label}</span>
        </Link>
      </div>
    </div>
  );
}
