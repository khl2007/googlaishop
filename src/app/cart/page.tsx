
"use client";

import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, X, Minus, Plus } from "lucide-react";

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();

  return (
    <div className="container mx-auto my-12 px-4">
      <h1 className="mb-8 text-4xl font-extrabold font-headline tracking-tight lg:text-5xl">Your Cart</h1>
      {cartItems.length > 0 ? (
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {cartItems.map((item) => (
                    <div key={item.variantId} className="flex items-center gap-4 p-4">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={100}
                        height={100}
                        className="rounded-md"
                        data-ai-hint="product image"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">{item.variantName}</p>
                        <p className="mt-2 font-bold text-primary">${item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center rounded-md border border-input">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 rounded-r-none"
                                onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                            >
                                <Minus className="h-4 w-4" />
                            </Button>
                            <span
                              className="h-10 w-12 flex items-center justify-center bg-transparent text-center text-sm font-medium"
                            >
                              {item.quantity}
                            </span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 rounded-l-none"
                                onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                         <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.variantId)}>
                          <X className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal ({cartCount} items)</span>
                  <span className="font-semibold">${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-semibold">FREE</span>
                </div>
                 <div className="flex justify-between border-t pt-4">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-lg font-bold">${cartTotal.toFixed(2)}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 border-dashed border-2 rounded-lg">
           <ShoppingCart className="mx-auto h-24 w-24 text-muted-foreground/30" />
           <h2 className="mt-6 text-2xl font-semibold">Your cart is empty</h2>
           <p className="mt-2 text-muted-foreground">Looks like you haven't added anything to your cart yet.</p>
           <Button asChild className="mt-6">
             <Link href="/products">Start Shopping</Link>
           </Button>
        </div>
      )}
    </div>
  );
}
