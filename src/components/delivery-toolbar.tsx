
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { Address, User } from "@/lib/types";
import { Loader2, MapPin, Plus } from "lucide-react";
import { AddressAutocomplete } from "@/components/address-autocomplete";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCsrfToken } from "@/lib/csrf";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { cn } from "@/lib/utils";

// --- Address Form Schema ---
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

export function DeliveryToolbar({ user }: { user: User | null }) {
  const [deliveryLocation, setDeliveryLocation] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalView, setModalView] = useState<'select' | 'add'>('select');
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const [cities, setCities] = useState<string[]>([]);
  const [isCitiesLoading, setIsCitiesLoading] = useState(true);
  const [defaultCountry, setDefaultCountry] = useState('');

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      street: "", apartment: "", city: "", area: "", state: "", zip: "", country: "", googleMapUrl: "",
    },
  });

  useEffect(() => {
    const initializeLocation = async () => {
      setIsLoading(true);
      if (user) {
        try {
          const res = await fetch('/api/user/addresses');
          if (!res.ok) throw new Error('Failed to fetch addresses');
          const data: Address[] = await res.json();
          setAddresses(data);
          const primaryAddress = data.find(a => a.isPrimary) || data[0];
          setDeliveryLocation(primaryAddress?.city || null);
        } catch (error) {
          console.error(error);
          setDeliveryLocation(null);
        }
      } else {
        const guestCity = localStorage.getItem('guestCity');
        setDeliveryLocation(guestCity);
      }
      setIsLoading(false);
    };
    initializeLocation();
  }, [user]);
  
  useEffect(() => {
    const fetchPrerequisites = async () => {
        setIsCitiesLoading(true);
        try {
            const settingsRes = await fetch('/api/settings');
            if (!settingsRes.ok) throw new Error("Failed to fetch settings");
            const settingsData = await settingsRes.json();
            
            if (settingsData.country) {
                setDefaultCountry(settingsData.country);
                form.setValue('country', settingsData.country);
                const citiesRes = await fetch(`/api/cities?country=${encodeURIComponent(settingsData.country)}`);
                if (!citiesRes.ok) throw new Error("Failed to fetch cities");
                const citiesData = await citiesRes.json();
                setCities(citiesData);
            }
        } catch (error: any) {
            toast({ title: "Error", description: "Could not load country/city data.", variant: "destructive" });
        } finally {
            setIsCitiesLoading(false);
        }
    };
    fetchPrerequisites();
  }, [toast, form]);

  const handleModalOpen = () => {
    if (user && addresses.length > 0) {
      setModalView('select');
    } else {
      setModalView('add');
      setStep(1);
      form.reset({
        fullName: user?.fullName || "",
        street: "", apartment: "", city: "", area: "", state: "", zip: "", country: defaultCountry, googleMapUrl: ""
      });
    }
    setIsModalOpen(true);
  };
  
  const handleSelectAddress = async (addressId: number) => {
    try {
        const res = await fetch(`/api/user/addresses/${addressId}/set-primary`, { 
            method: 'PUT',
            headers: {'x-csrf-token': getCsrfToken()}
        });
        if (!res.ok) throw new Error(await res.json().then(d => d.message));
        
        const selectedAddress = addresses.find(a => a.id === addressId);
        if (selectedAddress) {
            setDeliveryLocation(selectedAddress.city);
        }
        toast({ title: "Success", description: "Delivery location updated." });
        setIsModalOpen(false);
        const refreshedAddresses = await fetch('/api/user/addresses').then(res => res.json());
        setAddresses(refreshedAddresses);
    } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const onSaveAddress = async (data: AddressFormValues) => {
    try {
        const res = await fetch('/api/user/addresses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-csrf-token': getCsrfToken() },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(await res.json().then(d => d.message));
        
        toast({ title: "Success", description: "Address saved successfully." });
        
        const newAddressRes = await fetch('/api/user/addresses');
        const updatedAddresses = await newAddressRes.json();
        setAddresses(updatedAddresses);
        
        const newPrimary = updatedAddresses.find((a: Address) => a.isPrimary) || updatedAddresses[0];
        if (newPrimary) {
            setDeliveryLocation(newPrimary.city);
        }
        
        setIsModalOpen(false);
    } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleAutocompleteSelect = (address: { street: string; city: string; state: string; zip: string; country: string; }, location: { lat: number; lng: number } | null) => {
    if (defaultCountry && address.country && defaultCountry !== address.country) {
        toast({ title: "Country Mismatch", description: `This store only ships to ${defaultCountry}.`, variant: "destructive" });
    }

    if(location) form.setValue("googleMapUrl", `https://www.google.com/maps?q=${location.lat},${location.lng}`);
    form.setValue("street", address.street);
    form.setValue("city", address.city);
    form.setValue("state", address.state ?? "");
    form.setValue("zip", address.zip);
    form.setValue("country", address.country);
  };
  
  const handleConfirmLocation = () => {
    const city = form.getValues('city');
    if (!city) {
        toast({ title: "Location not set", description: "Please select a location on the map.", variant: "destructive" });
        return;
    }
    if (user) {
        setStep(2);
    } else {
        localStorage.setItem('guestCity', city);
        setDeliveryLocation(city);
        toast({ title: "Location Set", description: `Delivery city set to ${city}.` });
        setIsModalOpen(false);
    }
  };

  const primaryAddressId = (addresses.find(a => a.isPrimary) || addresses[0])?.id;

  return (
    <>
      <div className="bg-muted/60 border-b">
        <div className="container mx-auto px-4">
          <Button variant="ghost" className="h-10 text-muted-foreground w-full justify-start px-0 hover:bg-transparent" onClick={handleModalOpen}>
            <MapPin className="h-4 w-4 mr-2" />
            <span className="text-sm">
                {isLoading ? "Loading location..." : (deliveryLocation ? `Deliver to: ${deliveryLocation}` : 'Select Delivery Location')}
            </span>
          </Button>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className={cn(
            "p-0 flex flex-col gap-0",
            modalView === 'add' ? "h-screen w-screen max-w-full sm:h-[90vh] sm:max-w-4xl sm:rounded-lg" : "max-w-lg"
        )}>
          {modalView === 'select' && user ? (
              <>
                <DialogHeader className="p-4 border-b">
                    <DialogTitle>Select Delivery Address</DialogTitle>
                </DialogHeader>
                <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
                    <RadioGroup defaultValue={primaryAddressId?.toString()} onValueChange={(val) => handleSelectAddress(Number(val))}>
                        {addresses.map(address => (
                            <Label key={address.id} htmlFor={`address-${address.id}`} className="flex items-start gap-4 rounded-md border p-4 cursor-pointer hover:bg-accent has-[[data-state=checked]]:bg-accent">
                                <RadioGroupItem value={address.id.toString()} id={`address-${address.id}`} className="mt-1" />
                                <div>
                                    <p className="font-semibold">{address.fullName}{address.isPrimary && <span className="ml-2 text-xs font-bold text-primary">(PRIMARY)</span>}</p>
                                    <p className="text-sm text-muted-foreground">{address.street}, {address.city}, {address.zip}</p>
                                </div>
                            </Label>
                        ))}
                    </RadioGroup>
                </div>
                <DialogFooter className="p-4 border-t">
                    <Button variant="outline" className="w-full" onClick={() => { setModalView('add'); setStep(1); }}>
                        <Plus className="mr-2 h-4 w-4" /> Add New Address
                    </Button>
                </DialogFooter>
              </>
          ) : (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSaveAddress)} className="flex h-full flex-col">
                    {step === 1 && (
                        <>
                            <DialogHeader className="p-4 border-b shrink-0">
                                <DialogTitle>Step 1: Pin Your Location</DialogTitle>
                                <DialogDescription>Search for or click on the map to find your address.</DialogDescription>
                            </DialogHeader>
                            <div className="flex-1 relative">
                                <AddressAutocomplete onSelect={handleAutocompleteSelect} />
                            </div>
                            <DialogFooter className="p-4 border-t shrink-0">
                                <Button type="button" className="w-full" size="lg" onClick={handleConfirmLocation}>
                                    Confirm Location
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                    {step === 2 && user && (
                        <>
                            <DialogHeader className="p-4 border-b shrink-0">
                                <DialogTitle>Step 2: Confirm Your Details</DialogTitle>
                            </DialogHeader>
                            <div className="flex-1 space-y-4 overflow-y-auto p-4">
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
                                    <FormField control={form.control} name="country" render={({ field }) => (
                                    <FormItem><FormLabel>Country</FormLabel><FormControl><Input {...field} readOnly disabled className="bg-muted/50" /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <FormField control={form.control} name="city" render={({ field }) => (
                                    <FormItem><FormLabel>City</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value} disabled={isCitiesLoading || cities.length === 0}>
                                        <FormControl><SelectTrigger><SelectValue placeholder={isCitiesLoading ? "Loading..." : "Select a city"} /></SelectTrigger></FormControl>
                                        <SelectContent>{cities.map((cityName) => (<SelectItem key={cityName} value={cityName}>{cityName}</SelectItem>))}</SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                    )}/>
                                </div>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <FormField control={form.control} name="area" render={({ field }) => (<FormItem><FormLabel>Area / District (Optional)</FormLabel><FormControl><Input placeholder="e.g. Downtown" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                    <FormField control={form.control} name="zip" render={({ field }) => (<FormItem><FormLabel>ZIP / Postal</FormLabel><FormControl><Input placeholder="12345" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                </div>
                            </div>
                            <DialogFooter className="p-4 border-t shrink-0 flex justify-between w-full">
                                <Button type="button" variant="outline" onClick={() => setStep(1)}>Back</Button>
                                <Button type="submit" disabled={form.formState.isSubmitting}>
                                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Address
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                    </form>
                </Form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
