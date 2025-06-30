
"use client";

import Link from "next/link";
import {
  Button,
  buttonVariants,
} from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  ShoppingCart,
  X,
  ArrowLeft,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "@/hooks/use-cart";
import Image from "next/image";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";
import type { User } from "@/lib/types";
import { UserNav } from "./user-nav";
import { useRouter, usePathname } from "next/navigation";

const navLinks = [
  { href: "/products", label: "All Products" },
  { href: "/categories", label: "Categories" },
  { href: "/#about", label: "About Us" },
];

interface HeaderProps {
  user: User | null;
}

export function Header({ user }: HeaderProps) {
  const { cartItems, cartCount, cartTotal, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const isCustomer = !user || user.role === 'customer';
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b transition-colors duration-300",
      scrolled 
        ? "border-border bg-background/80 backdrop-blur-sm" 
        : "border-transparent bg-[linear-gradient(to_left,#18101a,#431d4f_50%,#2d1d60_60%,#432066)]"
    )}>
      <div className="container flex h-16 max-w-7xl items-center justify-between">
        <div className="flex items-center gap-4">
          {pathname !== '/' && (
            <Button
              variant="ghost"
              size="icon"
              className={cn("md:hidden", scrolled ? "text-foreground hover:bg-accent" : "text-primary-foreground hover:bg-white/10 hover:text-primary-foreground")}
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Button>
          )}

          <Link href="/" className={cn(
            "items-center gap-2",
            pathname === '/' ? "flex md:flex" : "hidden md:flex"
          )}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
            <span className={cn("font-bold font-headline text-lg", scrolled ? "text-foreground" : "text-primary-foreground")}>Zain</span>
          </Link>
          <nav className="hidden items-center gap-4 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn("text-sm font-medium transition-colors", scrolled ? "text-muted-foreground hover:text-foreground" : "text-primary-foreground/80 hover:text-primary-foreground")}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 md:flex">
            {user ? (
                <UserNav user={user} scrolled={scrolled}/>
            ) : (
                <>
                    <Link href="/login" className={cn(buttonVariants({ variant: scrolled ? 'outline' : 'ghost' }), scrolled ? 'rounded-full' : 'text-primary-foreground hover:bg-white/10 hover:text-primary-foreground')}>
                        Log In
                    </Link>
                    <Link href="/register" className={cn(buttonVariants({ variant: "default" }), "bg-primary text-primary-foreground hover:bg-primary/90", scrolled && "rounded-full")}>
                        Sign Up
                    </Link>
                </>
            )}
          </div>
          {isCustomer && (
            <Button
              variant={scrolled ? "outline" : "ghost"}
              size="icon"
              className={cn("relative hidden md:inline-flex", !scrolled && "text-primary-foreground border-primary-foreground/50 hover:bg-white/10 hover:text-primary-foreground border", scrolled && "rounded-full")}
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className={cn("absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold", scrolled ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground")}>
                  {cartCount}
                </span>
              )}
            </Button>
          )}
        </div>
      </div>

      <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
        <SheetContent className="flex w-full flex-col sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Shopping Cart ({cartCount})</SheetTitle>
          </SheetHeader>
          {cartItems.length > 0 ? (
            <>
              <div className="flex-1 overflow-y-auto pr-4">
                <div className="flex flex-col gap-4">
                  {cartItems.map(item => (
                    <div key={item.variantId} className="flex items-center gap-4">
                      <Image src={item.image} alt={item.name} width={80} height={80} className="rounded-md" data-ai-hint="product image" />
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">{item.variantName}</p>
                        <p className="text-sm font-medium">${item.price.toFixed(2)}</p>
                        <div className="mt-2 flex items-center gap-2">
                           <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.variantId, parseInt(e.target.value))}
                              className="h-8 w-16"
                            />
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.variantId)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between font-bold">
                  <span>Subtotal</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">Shipping and taxes calculated at checkout.</p>
                <Button asChild size="lg" className={cn("mt-4 w-full bg-primary text-primary-foreground hover:bg-primary/90")} onClick={() => setIsCartOpen(false)}>
                    <Link href="/checkout">Checkout</Link>
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-4">
                <ShoppingCart className="h-24 w-24 text-muted-foreground/30" />
                <p className="text-lg text-muted-foreground">Your cart is empty.</p>
                <Button asChild onClick={() => setIsCartOpen(false)}>
                    <Link href="/products">Start Shopping</Link>
                </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </header>
  );
}
