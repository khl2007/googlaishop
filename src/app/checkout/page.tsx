
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
import { Loader2, CreditCard, Wallet, DollarSign, Truck, Info } from "lucide-react";
import type { Address, User, CartItem } from "@/lib/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Separator } from "@/components/ui/separator";
import { AddressAutocomplete } from "@/components/address-autocomplete";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCsrfToken } from "@/lib/csrf";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const addressFormSchema = z.object({
  fullName: z.string().min(2, "Full name is required."),
  street: z.string().min(3, "Street address is required."),
  apartment: z.string().optional(),
  city: z.string().min(2, "City is required."),
  area: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().min(3, "ZIP/Postal code is required."),
  country: z.string().min(2, "Country is required."),
  googleMapUrl: z.string().url().optional().or(z.literal('')),
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

interface CalculatedShippingMethod {
  id: number;
  title: string;
  logo: string | null;
  cost: number;
}

interface PageSettings {
    checkoutRequiresVerification: boolean;
}

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const { toast } = useToast();

  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<PageSettings | null>(null);
  const [loadingInitialData, setLoadingInitialData] = useState(true);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [step, setStep] = useState(1);

  const [shippingOptions, setShippingOptions] = useState<CalculatedShippingMethod[]>([]);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [selectedShippingMethodId, setSelectedShippingMethodId] = useState<string>('');

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  
  const [cities, setCities] = useState<string[]>([]);
  const [isCitiesLoading, setIsCitiesLoading] = useState(true);

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      fullName: "", street: "", apartment: "", city: "", area: "", state: "", zip: "", country: "", googleMapUrl: "",
    },
  });

  useEffect(() => {
    if (cartItems.length === 0) {
      const timeoutId = setTimeout(() => {
        if (cartItems.length === 0) {
          router.push("/");
        }
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [cartItems.length, router]);

  useEffect(() => {
    const fetchInitialData = async () => {
        setLoadingInitialData(true);
        try {
            const [userRes, settingsRes, addressesRes, paymentMethodsRes] = await Promise.all([
                fetch('/api/auth/me'),
                fetch('/api/settings'),
                fetch('/api/user/addresses'),
                fetch('/api/payment-methods'),
            ]);

            if (!userRes.ok || !settingsRes.ok || !addressesRes.ok || !paymentMethodsRes.ok) {
                 throw new Error('Failed to load checkout data.');
            }
            
            const userData = await userRes.json();
            setUser(userData);
            
            const settingsData = await settingsRes.json();
            setSettings(settingsData);
            
            const addressesData = await addressesRes.json();
            setAddresses(addressesData);
            if (addressesData.length > 0) {
                const primaryAddress = addressesData.find((a: Address) => a.isPrimary) || addressesData[0];
                setSelectedAddressId(String(primaryAddress.id));
            } else {
                openNewAddressDialog();
            }
            
            const paymentMethodsData = await paymentMethodsRes.json();
            setPaymentMethods(paymentMethodsData);
            if (paymentMethodsData.length > 0) {
                setSelectedPaymentMethod(paymentMethodsData[0].provider);
            }
        } catch (error: any) {
             toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setLoadingInitialData(false);
        }
    };

    if (cartItems.length > 0) {
      fetchInitialData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItems.length, toast]);
  
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

  const openNewAddressDialog = () => {
      setStep(1);
      form.reset({
          fullName: user?.fullName || "",
          street: "",
          apartment: "",
          city: "",
          area: "",
          state: "",
          zip: "",
          country: form.getValues('country'),
          googleMapUrl: ""
      });
      setIsAddressDialogOpen(true);
  };
  
  const handleConfirmLocation = () => {
    if (!form.getValues('street')) {
        toast({
            title: "Location not selected",
            description: "Please search for or click on the map to select an address.",
            variant: "destructive",
        })
        return;
    }
    setStep(2);
  }

  const onSaveAddress = async (data: AddressFormValues) => {
    try {
        const res = await fetch('/api/user/addresses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-csrf-token': getCsrfToken() },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed to save address");
        const newAddressData = await res.json();
        
        toast({ title: "Success", description: "Address saved successfully." });
        setIsAddressDialogOpen(false);
        form.reset();
        
        const addressesRes = await fetch('/api/user/addresses');
        const updatedAddresses = await addressesRes.json();
        setAddresses(updatedAddresses);

        setSelectedAddressId(String(newAddressData.address.id));
    } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  useEffect(() => {
    const fetchShippingOptions = async () => {
      if (selectedAddressId && cartItems.length > 0) {
        setLoadingShipping(true);
        setShippingOptions([]);
        setSelectedShippingMethodId('');
        try {
          const res = await fetch('/api/shipping-cost', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-csrf-token': getCsrfToken() },
            body: JSON.stringify({ addressId: parseInt(selectedAddressId), cartItems }),
          });
          if (!res.ok) {
            throw new Error('Failed to fetch shipping options');
          }
          const data = await res.json();
          setShippingOptions(data);
          if (data.length > 0) {
            setSelectedShippingMethodId(String(data[0].id));
          }
        } catch (error: any) {
          toast({ title: 'Shipping Error', description: error.message, variant: 'destructive' });
          setShippingOptions([]);
        } finally {
          setLoadingShipping(false);
        }
      } else {
        setShippingOptions([]);
      }
    };
    fetchShippingOptions();
  }, [selectedAddressId, cartItems, toast]);
  
  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCheckoutAllowed) return;

    if (!selectedAddressId) {
        toast({ title: "Error", description: "Please select or add a valid shipping address.", variant: "destructive" });
        return;
    }
    if (shippingOptions.length > 0 && !selectedShippingMethodId) {
        toast({ title: "Error", description: "Please select a shipping method.", variant: "destructive" });
        return;
    }
    if (!selectedPaymentMethod) {
        toast({ title: "Error", description: "Please select a payment method.", variant: "destructive" });
        return;
    }
    
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

  const handleAutocompleteSelect = (
    address: { street: string; city: string; state: string; zip: string; country: string; },
    location: { lat: number; lng: number } | null
  ) => {
    const storeCountry = form.getValues('country');
    if (storeCountry && address.country && storeCountry !== address.country) {
        toast({
            title: "Country Mismatch",
            description: `The address is in ${address.country}, but this store only ships to ${storeCountry}.`,
            variant: "destructive"
        });
    }

    if(location) {
      const url = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
      form.setValue("googleMapUrl", url);
    }
    
    form.setValue("street", address.street);
    form.setValue("city", address.city);
    form.setValue("state", address.state ?? "");
    form.setValue("zip", address.zip);
    
    if (address.city && !cities.includes(address.city)) {
        setCities(prev => [address.city, ...prev]);
    }
  };

  const selectedShippingCost = shippingOptions.find(o => String(o.id) === selectedShippingMethodId)?.cost || 0;
  const orderTotal = cartTotal + selectedShippingCost;
  const isCheckoutAllowed = !settings?.checkoutRequiresVerification || (user?.isVerified ?? false);

  if (cartItems.length === 0 || loadingInitialData) {
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
    <>
    <div className="container mx-auto my-12 px-4">
      <h1 className="mb-8 text-center text-4xl font-extrabold font-headline tracking-tight lg:text-5xl">Checkout</h1>
      {!isCheckoutAllowed && (
        <Alert variant="destructive" className="mb-8 max-w-2xl mx-auto">
            <Info className="h-4 w-4" />
            <AlertTitle>Account Not Verified</AlertTitle>
            <AlertDescription>
                Your account must be verified to complete the checkout process. Please check your email for a verification link.
            </AlertDescription>
        </Alert>
      )}
      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Shipping Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <RadioGroup value={selectedAddressId} onValueChange={setSelectedAddressId} className="space-y-4">
                        {addresses.map((address) => (
                            <Label key={address.id} htmlFor={String(address.id)} className="flex items-start gap-4 rounded-md border p-4 cursor-pointer hover:bg-accent has-[[data-state=checked]]:bg-accent">
                                <RadioGroupItem value={String(address.id)} id={String(address.id)} className="mt-1" />
                                {renderAddress(address)}
                            </Label>
                        ))}
                    </RadioGroup>

                    <div className="pt-4 mt-4 border-t">
                        <Button type="button" variant="outline" className="w-full" onClick={openNewAddressDialog}>
                            Add a new address
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Shipping Method</CardTitle>
                </CardHeader>
                <CardContent>
                    {loadingShipping ? (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Loading shipping options...</span>
                        </div>
                    ) : shippingOptions.length > 0 ? (
                        <RadioGroup value={selectedShippingMethodId} onValueChange={setSelectedShippingMethodId} className="space-y-4">
                            {shippingOptions.map((method) => (
                                <Label key={method.id} htmlFor={`shipping-${method.id}`} className="flex items-center justify-between gap-4 rounded-md border p-4 cursor-pointer hover:bg-accent has-[[data-state=checked]]:bg-accent">
                                    <div className="flex items-center gap-4">
                                        <RadioGroupItem value={String(method.id)} id={`shipping-${method.id}`} />
                                        {method.logo && <Image src={method.logo} alt={method.title} width={40} height={24} className="object-contain" />}
                                        <p className="font-semibold">{method.title}</p>
                                    </div>
                                    <p className="font-semibold">{method.cost > 0 ? `$${method.cost.toFixed(2)}` : 'FREE'}</p>
                                </Label>
                            ))}
                        </RadioGroup>
                    ) : (
                        <div className="flex items-center gap-3 text-muted-foreground border-dashed border rounded-md p-6 justify-center">
                            <Truck className="h-8 w-8" />
                            <p>Please select an address to view shipping options.</p>
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
                  <span>{selectedShippingCost > 0 ? `$${selectedShippingCost.toFixed(2)}` : 'FREE'}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                  <span>Total</span>
                  <span>${orderTotal.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
           <Button size="lg" type="submit" className="mt-6 w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={loadingShipping || !isCheckoutAllowed}>
              {loadingShipping && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Place Order
            </Button>
        </div>
      </form>
    </div>

    <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
      <DialogContent className="h-[90dvh] w-screen max-w-full p-0 flex flex-col gap-0 sm:h-[85vh] sm:max-w-4xl sm:rounded-lg">
          <Form {...form}>
          <form onSubmit={form.handleSubmit(onSaveAddress)} className="flex h-full flex-col">
            {step === 1 && (
                <>
                    <DialogHeader className="p-4 border-b shrink-0">
                        <DialogTitle>Step 1: Pin Your Location</DialogTitle>
                        <DialogDescription>Search for or click on the map to find your address.</DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 relative min-h-0">
                        <AddressAutocomplete onSelect={handleAutocompleteSelect} />
                    </div>
                    <DialogFooter className="p-4 border-t shrink-0">
                        <Button type="button" className="w-full" size="lg" onClick={handleConfirmLocation}>
                          Confirm Location
                        </Button>
                    </DialogFooter>
                </>
            )}
            {step === 2 && (
                  <>
                    <DialogHeader className="p-4 border-b shrink-0">
                        <DialogTitle>Step 2: Confirm Your Details</DialogTitle>
                    </DialogHeader>
                      <div className="flex-1 space-y-4 overflow-y-auto p-4 min-h-0">
                        <FormField control={form.control} name="fullName" render={({ field }) => (
                            <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="street" render={({ field }) => (
                            <FormItem><FormLabel>Street Address</FormLabel><FormControl><Input placeholder="123 Main St" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="apartment" render={({ field }) => (
                            <FormItem><FormLabel>Apt, Suite, etc. (Optional)</FormLabel><FormControl><Input placeholder="Apt 4B" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <FormField
                            control={form.control}
                            name="country"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Country</FormLabel>
                                <FormControl>
                                  <Input {...field} readOnly disabled className="bg-muted/50" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>City</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                  disabled={isCitiesLoading || cities.length === 0}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder={isCitiesLoading ? "Loading..." : "Select a city"} />
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
                            )}
                          />
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <FormField control={form.control} name="area" render={({ field }) => (
                              <FormItem><FormLabel>Area / District (Optional)</FormLabel><FormControl><Input placeholder="e.g. Downtown" {...field} /></FormControl><FormMessage /></FormItem>
                          )}/>
                          <FormField control={form.control} name="zip" render={({ field }) => (
                              <FormItem><FormLabel>ZIP / Postal</FormLabel><FormControl><Input placeholder="12345" {...field} /></FormControl><FormMessage /></FormItem>
                          )}/>
                        </div>
                      </div>
                      <DialogFooter className="p-4 border-t shrink-0 flex justify-between w-full">
                          <Button type="button" variant="outline" onClick={() => setStep(1)}>Back</Button>
                          <Button type="submit" disabled={form.formState.isSubmitting}>
                              {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                              Save Address
                          </Button>
                      </DialogFooter>
                  </>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
    </>
  );
}
