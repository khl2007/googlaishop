
"use client";

import { useCart } from "@/hooks/use-cart";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import Image from "next/image";
import { Button } from "./ui/button";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

export function AddToCartDrawer() {
  const { isTopDrawerOpen, setIsTopDrawerOpen, lastAddedItem } = useCart();

  return (
    <Sheet open={isTopDrawerOpen} onOpenChange={setIsTopDrawerOpen}>
      <SheetContent
        side="top"
        className="p-4 sm:p-6 w-full max-w-none border-b shadow-lg data-[state=open]:animate-in data-[state=open]:slide-in-from-top data-[state=closed]:animate-out data-[state=closed]:slide-out-to-top"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <SheetHeader>
            <SheetTitle className="sr-only">Item Added to Cart</SheetTitle>
        </SheetHeader>
        {lastAddedItem && (
          <div className="container mx-auto max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              {/* First Row Content */}
              <div className="flex items-center gap-4">
                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                <div className="relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                  <Image
                    src={lastAddedItem.image}
                    alt={lastAddedItem.name}
                    fill
                    className="object-cover"
                    data-ai-hint="product image"
                  />
                </div>
                <div>
                  <p className="font-semibold">{lastAddedItem.name}</p>
                  <p className="text-sm text-muted-foreground">Added to cart</p>
                </div>
              </div>

              {/* Second Row Content (Buttons) */}
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  className="bg-white border-primary text-primary hover:bg-primary/10 flex-1"
                  onClick={() => setIsTopDrawerOpen(false)}
                >
                  Continue Shopping
                </Button>
                <Button asChild className="flex-1" onClick={() => setIsTopDrawerOpen(false)}>
                  <Link href="/checkout">Checkout</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
