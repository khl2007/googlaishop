
"use client";

import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import type { Address } from "@/lib/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Separator } from "@/components/ui/separator";

const addressFormSchema = z.object({
  fullName: z.string().min(2, "Full name is required."),
  street: z.string().min(3, "Street address is required."),
  apartment: z.string().optional(),
  city: z.string().min(2, "City is required."),
  state: z.string().optional(),
  zip: z.string().min(3, "ZIP/Postal code is required."),
  country: z.string().min(2, "Country is required."),
});

type AddressFormValues = z.infer<typeof addressFormSchema>;

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const { toast } = useToast();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      fullName: "",
      street: "",
      apartment: "",
      city: "",
      state: "",
      zip: "",
      country: "",
    },
  });

  const fetchAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const res = await fetch('/api/user/addresses');
      if (!res.ok) throw new Error("Failed to fetch addresses");
      const data = await res.json();
      setAddresses(data);
      if (data.length > 0) {
        // Pre-select the first (primary) address
        setSelectedAddressId(String(data[0].id));
        setIsAddingNewAddress(false);
      } else {
        // If no addresses, show the new address form
        setIsAddingNewAddress(true);
        setSelectedAddressId('new');
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    if (cartItems.length > 0) {
        fetchAddresses();
    }
  }, [cartItems.length]);

  useEffect(() => {
    // Redirect if cart is empty, but only after initial check.
    // This prevents redirecting before the cart is loaded from localStorage.
    if (cartItems.length === 0 && !useCart.length) {
      const timeoutId = setTimeout(() => {
        if (useCart.length === 0) {
           router.push("/");
        }
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [cartItems.length, router]);
  
  const handleAddNewAddress: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    await form.handleSubmit(async (data) => {
        try {
            const res = await fetch('/api/user/addresses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to save address");
            toast({ title: "Success", description: "Address saved successfully." });
            form.reset();
            await fetchAddresses(); // Refetch to get the new address and select it
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    })(e);
  };
  
  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAddressId || selectedAddressId === 'new') {
        toast({ title: "Error", description: "Please select or add a shipping address.", variant: "destructive" });
        return;
    }
    
    toast({
      title: "Order Placed!",
      description: "Thank you for your purchase. Your order is being processed.",
    });
    clearCart();
    router.push("/");
  }

  if (cartItems.length === 0 || loadingAddresses) {
    return (
      <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">{cartItems.length === 0 ? "Redirecting..." : "Loading addresses..."}</p>
        </div>
      </div>
    );
  }

  const renderAddress = (address: Address) => (
    <div>
        <p className="font-semibold">{address.fullName}</p>
        <p className="text-sm text-muted-foreground">{address.street}{address.apartment ? `, ${address.apartment}` : ''}</p>
        <p className="text-sm text-muted-foreground">{address.city}, {address.zip}</p>
        <p className="text-sm text-muted-foreground">{address.country}</p>
    </div>
  );

  return (
    <div className="container mx-auto my-12 px-4">
      <h1 className="mb-8 text-center text-4xl font-extrabold font-headline tracking-tight lg:text-5xl">Checkout</h1>
      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <Card className="lg:col-span-1 self-start">
          <CardHeader>
            <CardTitle>Shipping Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup value={selectedAddressId} onValueChange={(value) => {
                setSelectedAddressId(value);
                setIsAddingNewAddress(value === 'new');
            }}>
                {addresses.map((address) => (
                    <Label key={address.id} htmlFor={String(address.id)} className="flex items-start gap-4 rounded-md border p-4 cursor-pointer hover:bg-accent has-[[data-state=checked]]:bg-accent">
                         <RadioGroupItem value={String(address.id)} id={String(address.id)} className="mt-1" />
                         {renderAddress(address)}
                    </Label>
                ))}
                <Label htmlFor="new" className="flex items-start gap-4 rounded-md border p-4 cursor-pointer hover:bg-accent has-[[data-state=checked]]:bg-accent">
                    <RadioGroupItem value="new" id="new" className="mt-1" />
                    <div>
                        <p className="font-semibold">Add a new address</p>
                    </div>
                </Label>
            </RadioGroup>

            {isAddingNewAddress && (
                <div className="pt-6 border-t">
                    <Form {...form}>
                        <form onSubmit={handleAddNewAddress} className="space-y-4">
                            <FormField control={form.control} name="fullName" render={({ field }) => (
                                <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="street" render={({ field }) => (
                                <FormItem><FormLabel>Street Address</FormLabel><FormControl><Input placeholder="123 Main St" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="apartment" render={({ field }) => (
                                <FormItem><FormLabel>Apartment, suite, etc. (optional)</FormLabel><FormControl><Input placeholder="Apt 4B" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <div className="grid grid-cols-3 gap-4">
                                <FormField control={form.control} name="city" render={({ field }) => (
                                    <FormItem className="col-span-2"><FormLabel>City</FormLabel><FormControl><Input placeholder="Anytown" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="zip" render={({ field }) => (
                                    <FormItem><FormLabel>ZIP</FormLabel><FormControl><Input placeholder="12345" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                            </div>
                            <FormField control={form.control} name="country" render={({ field }) => (
                                <FormItem><FormLabel>Country</FormLabel><FormControl><Input placeholder="United States" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Address
                            </Button>
                        </form>
                    </Form>
                </div>
            )}
          </CardContent>
        </Card>
        
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Your Order</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 divide-y">
                {cartItems.map((item) => (
                  <div key={item.variantId} className="flex items-center justify-between pt-4 first:pt-0">
                    <div className="flex items-center gap-4">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="rounded-md"
                        data-ai-hint="product image"
                      />
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.variantName} x {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <Separator className="my-6" />
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>FREE</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
           <Button size="lg" type="submit" className="mt-6 w-full bg-primary text-primary-foreground hover:bg-primary/90">
              Place Order
            </Button>
        </div>
      </form>
    </div>
  );
}
