
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { Address } from "@/lib/types";
import { Loader2, Plus, Edit, Trash2, Home, Star } from "lucide-react";
import { AddressAutocomplete } from "@/components/address-autocomplete";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCsrfToken } from "@/lib/csrf";

const addressFormSchema = z.object({
  id: z.number().optional(),
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

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<Address | null>(null);
  const { toast } = useToast();
  const [isSettingPrimary, setIsSettingPrimary] = useState<number | null>(null);

  const [cities, setCities] = useState<string[]>([]);
  const [isCitiesLoading, setIsCitiesLoading] = useState(true);
  const [defaultCountry, setDefaultCountry] = useState('');
  
  const [step, setStep] = useState(1);

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
      country: "",
      googleMapUrl: "",
    },
  });

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/user/addresses');
      if (!res.ok) throw new Error('Failed to fetch addresses');
      const data = await res.json();
      setAddresses(data);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  useEffect(() => {
    const fetchPrerequisites = async () => {
        setIsCitiesLoading(true);
        try {
            const settingsRes = await fetch('/api/settings');
            if (!settingsRes.ok) throw new Error("Failed to fetch settings");
            const settingsData = await settingsRes.json();
            
            if (settingsData.country) {
                setDefaultCountry(settingsData.country);
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
    fetchPrerequisites();
  }, [toast]);


  const openDialog = (address?: Address) => {
    setStep(1); // Always start at step 1
    form.reset(address || { 
      fullName: "", 
      street: "", 
      apartment: "", 
      city: "", 
      area: "", 
      state: "", 
      zip: "", 
      country: defaultCountry,
      googleMapUrl: ""
    });
    setIsDialogOpen(true);
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

  const onSubmit = async (data: AddressFormValues) => {
    const isEditing = !!data.id;
    const url = isEditing ? `/api/user/addresses/${data.id}` : '/api/user/addresses';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 
            'Content-Type': 'application/json',
            'x-csrf-token': getCsrfToken(),
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Failed to ${isEditing ? 'update' : 'add'} address`);
      }

      toast({ title: "Success", description: `Address ${isEditing ? 'updated' : 'saved'} successfully.` });
      setIsDialogOpen(false);
      fetchAddresses(); // Refresh the list
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!addressToDelete) return;
    try {
      const res = await fetch(`/api/user/addresses/${addressToDelete.id}`, { 
        method: 'DELETE',
        headers: {
            'x-csrf-token': getCsrfToken(),
        }
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete address');
      }
      toast({ title: "Success", description: "Address deleted successfully." });
      setAddresses(addresses.filter(a => a.id !== addressToDelete.id));
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsDeleteDialogOpen(false);
      setAddressToDelete(null);
    }
  };

  const handleSetPrimary = async (addressId: number) => {
    setIsSettingPrimary(addressId);
    try {
        const res = await fetch(`/api/user/addresses/${addressId}/set-primary`, { 
            method: 'PUT',
            headers: {
                'x-csrf-token': getCsrfToken(),
            }
        });
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'Failed to set primary address');
        }
        toast({ title: "Success", description: "Primary address updated." });
        await fetchAddresses(); // Refresh the list to show the new primary address
    } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
        setIsSettingPrimary(null);
    }
  };
  
  const handleAutocompleteSelect = (
    address: { street: string; city: string; state: string; zip: string; country: string; },
    location: { lat: number, lng: number } | null
  ) => {
    const storeCountry = defaultCountry;
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
    form.setValue("country", address.country);

    if (address.city && !cities.includes(address.city)) {
        setCities(prev => [address.city, ...prev]);
    }
  };

  return (
    <div className="container mx-auto my-6 max-w-4xl px-4 md:my-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold md:text-3xl">My Addresses</h1>
        <Button onClick={() => openDialog()}>
          <Plus className="mr-2 h-4 w-4" /> Add New Address
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin" /></div>
      ) : addresses.length === 0 ? (
        <Card className="border-dashed py-16 text-center">
          <CardContent>
            <Home className="mx-auto h-16 w-16 text-muted-foreground/30" />
            <h3 className="mt-4 text-xl font-semibold">No addresses found</h3>
            <p className="mt-2 text-muted-foreground">Add a new address to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {addresses.map((address) => (
            <Card key={address.id} className="flex flex-col">
              <CardContent className="flex-1 p-6">
                {address.isPrimary && <span className="mb-2 block text-xs font-bold text-primary">PRIMARY</span>}
                <p className="font-semibold">{address.fullName}</p>
                <p className="text-sm text-muted-foreground">{address.street}{address.apartment ? `, ${address.apartment}` : ''}</p>
                <p className="text-sm text-muted-foreground">{address.city}{address.area ? `, ${address.area}` : ''}, {address.zip}</p>
                <p className="text-sm text-muted-foreground">{address.country}</p>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 bg-muted/50 p-3">
                {!address.isPrimary && (
                  <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetPrimary(address.id)}
                      disabled={isSettingPrimary === address.id}
                  >
                      {isSettingPrimary === address.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                          <Star className="mr-2 h-4 w-4" />
                      )}
                      Set as Primary
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => openDialog(address)}>
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => { setAddressToDelete(address); setIsDeleteDialogOpen(true); }} disabled={address.isPrimary}>
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="h-screen w-screen max-w-full p-0 flex flex-col gap-0 sm:rounded-none">
           <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex h-full flex-col">
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
              {step === 2 && (
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
      
      {/* Delete Confirmation Dialog */}
       <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the address.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
