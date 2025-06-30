
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
import { Loader2, Search, CreditCard, Wallet, DollarSign } from "lucide-react";
import type { Address } from "@/lib/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AddressAutocomplete } from "@/components/address-autocomplete";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const addressFormSchema = z.object({
  fullName: z.string().min(2, "Full name is required."),
  street: z.string().min(3, "Street address is required."),
  apartment: z.string().optional(),
  city: z.string().min(2, "City is required."),
  area: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().min(3, "ZIP/Postal code is required."),
  country: z.string().min(2, "Country is required."),
});

type AddressFormValues = z.infer<typeof addressFormSchema>;

interface PaymentMethod {
    id: number;
    provider: string;
    enabled: number;
    config: {
        description?: string;
    }
}

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const { toast } = useToast();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false);

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(true);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  
  const [cities, setCities] = useState<string[]>([]);
  const [isCitiesLoading, setIsCitiesLoading] = useState(true);

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      fullName: "",
      street: "",
      apartment: "",
      city: "",
      area: "",
      state: "",
      zip: "",
      country: "", // Will be set by useEffect
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
        setSelectedAddressId(String(data[0].id));
        setIsAddingNewAddress(false);
      } else {
        setIsAddingNewAddress(true);
        setSelectedAddressId('new');
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoadingAddresses(false);
    }
  };

  const fetchPaymentMethods = async () => {
    setLoadingPaymentMethods(true);
    try {
        const res = await fetch('/api/payment-methods');
        if (!res.ok) throw new Error("Failed to fetch payment methods");
        const data = await res.json();
        setPaymentMethods(data);
        if (data.length > 0) {
            setSelectedPaymentMethod(data[0].provider);
        }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoadingPaymentMethods(false);
    }
  };

  useEffect(() => {
    if (cartItems.length > 0) {
        fetchAddresses();
        fetchPaymentMethods();
    }
  }, [cartItems.length]);
  
  useEffect(() => {
    const fetchSettingsAndCities = async () => {
        setIsCitiesLoading(true);
        try {
            const settingsRes = await fetch('/api/settings');
            if (!settingsRes.ok) throw new Error("Failed to fetch settings");
            const settingsData = await settingsRes.json();
            
            if (settingsData.country) {
                form.setValue('country', settingsData.country);

                const citiesRes = await fetch(`/api/cities?country=${encodeURIComponent(settingsData.country)}`);
                if (!citiesRes.ok) throw new Error("Failed to fetch cities");
                const citiesData = await citiesRes.json();
                setCities(citiesData);
            }
        } catch (error: any) {
            toast({ title: "Error", description: "Could not load country/city data.", variant: "destructive" });
            setCities([]);
        } finally {
            setIsCitiesLoading(false);
        }
    };

    fetchSettingsAndCities();
  }, [form, toast]);


  useEffect(() => {
    if (cartItems.length === 0 && !useCart.length) {
      const timeoutId = setTimeout(() => {
        if (useCart.length === 0) {
           router.push("/");
        }
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [cartItems.length, router]);
  
  const onSaveAddress = async (data: AddressFormValues) => {
    try {
        const res = await fetch('/api/user/addresses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed to save address");
        toast({ title: "Success", description: "Address saved successfully." });
        form.reset();
        await fetchAddresses();
    } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };
  
  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAddressId || (selectedAddressId === 'new' && !form.formState.isValid)) {
        toast({ title: "Error", description: "Please select or add a valid shipping address.", variant: "destructive" });
        return;
    }

    if (!selectedPaymentMethod) {
        toast({ title: "Error", description: "Please select a payment method.", variant: "destructive" });
        return;
    }
    
    // Clear cart before redirecting to payment page for Stripe/PayPal
    // to prevent users from modifying it during payment.
    if (selectedPaymentMethod !== 'cash') {
        clearCart();
        router.push(`/checkout/${selectedPaymentMethod}`);
    } else {
        toast({
          title: "Order Placed!",
          description: "Thank you for your purchase. Your order is being processed.",
        });
        clearCart();
        router.push("/checkout/cash-success");
    }
  };

  const handleAutocompleteSelect = (address: { street: string; city: string; state: string; zip: string; country: string; }) => {
    form.setValue("street", address.street);
    form.setValue("city", address.city);
    form.setValue("state", address.state ?? "");
    form.setValue("zip", address.zip);
    setIsAutocompleteOpen(false);
  };

  if (cartItems.length === 0 || loadingAddresses || loadingPaymentMethods) {
    return (
      <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">{cartItems.length === 0 ? "Redirecting..." : "Loading..."}</p>
        </div>
      </div>
    );
  }

  const renderAddress = (address: Address) => (
    <div>
        <p className="font-semibold">{address.fullName}</p>
        <p className="text-sm text-muted-foreground">{address.street}{address.apartment ? `, ${address.apartment}` : ''}</p>
        <p className="text-sm text-muted-foreground">{address.city}{address.area ? `, ${address.area}`: ''}, {address.zip}</p>
        <p className="text-sm text-muted-foreground">{address.country}</p>
    </div>
  );

  const getProviderTitle = (provider: string) => {
    switch(provider) {
        case 'cash': return 'Cash on Delivery';
        case 'stripe': return 'Stripe';
        case 'paypal': return 'PayPal';
        default: return provider;
    }
  };

  const getProviderIcon = (provider: string) => {
      switch(provider) {
          case 'cash': return <DollarSign className="h-5 w-5" />;
          case 'stripe': return <CreditCard className="h-5 w-5" />;
          case 'paypal': return <Wallet className="h-5 w-5" />;
          default: return <CreditCard className="h-5 w-5" />;
      }
  };

  return (
    <div className="container mx-auto my-12 px-4">
      <h1 className="mb-8 text-center text-4xl font-extrabold font-headline tracking-tight lg:text-5xl">Checkout</h1>
      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Shipping Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <RadioGroup value={selectedAddressId} onValueChange={(value) => {
                        setSelectedAddressId(value);
                        setIsAddingNewAddress(value === 'new');
                    }} className="space-y-4">
                        {addresses.map((address) => (
                            <Label key={address.id} htmlFor={String(address.id)} className="flex items-start gap-4 rounded-md border p-4 cursor-pointer hover:bg-accent has-[[data-state=checked]]:bg-accent">
                                <RadioGroupItem value={String(address.id)} id={String(address.id)} className="mt-1" />
                                {renderAddress(address)}
                            </Label>
                        ))}
                        <Label htmlFor="new" className="flex items-start gap-4 rounded-md border p-4 cursor-pointer hover:bg-accent has-[[data-state=checked]]:bg-accent">
                            <RadioGroupItem value="new" id="new" className="mt-1" />
                            <div><p className="font-semibold">Add a new address</p></div>
                        </Label>
                    </RadioGroup>

                    {isAddingNewAddress && (
                        <div className="pt-6 mt-6 border-t">
                            <Form {...form}>
                                <div className="space-y-4">
                                    <div className="flex justify-end">
                                        <Dialog open={isAutocompleteOpen} onOpenChange={setIsAutocompleteOpen}>
                                            <DialogTrigger asChild>
                                                <Button type="button" variant="outline" size="sm"><Search className="mr-2 h-4 w-4" />Find Address</Button>
                                            </DialogTrigger>
                                            <DialogContent><DialogHeader><DialogTitle>Find Address</DialogTitle></DialogHeader><AddressAutocomplete onSelect={handleAutocompleteSelect} /></DialogContent>
                                        </Dialog>
                                    </div>
                                    <FormField control={form.control} name="fullName" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                    <FormField control={form.control} name="street" render={({ field }) => (<FormItem><FormLabel>Street Address</FormLabel><FormControl><Input placeholder="123 Main St" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                    <FormField control={form.control} name="apartment" render={({ field }) => (<FormItem><FormLabel>Apartment, suite, etc. (optional)</FormLabel><FormControl><Input placeholder="Apt 4B" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                    
                                    <FormField control={form.control} name="country" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Country</FormLabel>
                                            <FormControl>
                                                <Input {...field} readOnly disabled className="bg-muted/50" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                    <div className="grid grid-cols-3 gap-4">
                                        <FormField control={form.control} name="city" render={({ field }) => (
                                            <FormItem className="col-span-2">
                                                <FormLabel>City</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isCitiesLoading || cities.length === 0}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder={isCitiesLoading ? "Loading cities..." : "Select a city"} />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {cities.map((cityName) => (
                                                            <SelectItem key={cityName} value={cityName}>
                                                                {cityName}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}/>
                                        <FormField control={form.control} name="zip" render={({ field }) => (<FormItem><FormLabel>ZIP</FormLabel><FormControl><Input placeholder="12345" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                    </div>
                                    <FormField control={form.control} name="area" render={({ field }) => (<FormItem><FormLabel>Area / District (Optional)</FormLabel><FormControl><Input placeholder="e.g. Downtown" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                    
                                    <Button type="button" onClick={form.handleSubmit(onSaveAddress)} disabled={form.formState.isSubmitting}>{form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save Address</Button>
                                </div>
                            </Form>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                    <RadioGroup value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod} className="space-y-4">
                        {paymentMethods.map((method) => (
                            <Label key={method.id} htmlFor={method.provider} className="flex items-center gap-4 rounded-md border p-4 cursor-pointer hover:bg-accent has-[[data-state=checked]]:bg-accent">
                                <RadioGroupItem value={method.provider} id={method.provider} />
                                {getProviderIcon(method.provider)}
                                <div className="flex-1">
                                    <p className="font-semibold">{getProviderTitle(method.provider)}</p>
                                    {method.provider === 'cash' && method.config.description && (
                                        <p className="text-sm text-muted-foreground">{method.config.description}</p>
                                    )}
                                </div>
                            </Label>
                        ))}
                    </RadioGroup>
                </CardContent>
            </Card>
        </div>
        
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Your Order</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 divide-y">
                {cartItems.map((item) => (
                  <div key={item.variantId} className="flex items-center justify-between pt-4 first:pt-0">
                    <div className="flex items-center gap-4">
                      <Image src={item.image} alt={item.name} width={64} height={64} className="rounded-md" data-ai-hint="product image" />
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
