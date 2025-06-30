
"use client";

import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search } from "lucide-react";
import type { Address } from "@/lib/types";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { AddressAutocomplete } from "../address-autocomplete";

const formSchema = z.object({
  fullName: z.string().min(2, "Full name is required."),
  street: z.string().min(3, "Street address is required."),
  apartment: z.string().optional(),
  city: z.string().min(2, "City is required."),
  area: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().min(3, "ZIP/Postal code is required."),
  country: z.string().min(2, "Country is required."),
});

type AddressFormValues = z.infer<typeof formSchema>;

interface AddressFormProps {
  address: Address | null;
  userId: string;
  returnPath: string;
}

export function AddressForm({ address, userId, returnPath }: AddressFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false);

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: address?.fullName || "",
      street: address?.street || "",
      apartment: address?.apartment || "",
      city: address?.city || "",
      area: address?.area || "",
      state: address?.state || "",
      zip: address?.zip || "",
      country: address?.country || "",
    },
  });
  
  const isSubmitting = form.formState.isSubmitting;

  const handleAutocompleteSelect = (address: { street: string; city: string; state: string; zip: string; country: string; }) => {
    form.setValue("street", address.street);
    form.setValue("city", address.city);
    form.setValue("state", address.state);
    form.setValue("zip", address.zip);
    form.setValue("country", address.country);
    setIsAutocompleteOpen(false);
  };


  const onSubmit: SubmitHandler<AddressFormValues> = async (data) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/address`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Something went wrong");
      }
      
      toast({
        title: "Success",
        description: "Address saved successfully.",
      });
      router.push(returnPath);
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
        <div className="flex justify-end">
            <Dialog open={isAutocompleteOpen} onOpenChange={setIsAutocompleteOpen}>
                <DialogTrigger asChild>
                    <Button type="button" variant="outline">
                        <Search className="mr-2 h-4 w-4" />
                        Find Address
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Find Address</DialogTitle>
                    </DialogHeader>
                    <AddressAutocomplete onSelect={handleAutocompleteSelect} />
                </DialogContent>
            </Dialog>
        </div>
        <FormField control={form.control} name="fullName" render={({ field }) => (
            <FormItem><FormLabel>Contact Full Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>
        )}/>
        <FormField control={form.control} name="street" render={({ field }) => (
            <FormItem><FormLabel>Street Address</FormLabel><FormControl><Input placeholder="123 Main St" {...field} /></FormControl><FormMessage /></FormItem>
        )}/>
        <FormField control={form.control} name="apartment" render={({ field }) => (
            <FormItem><FormLabel>Apartment, suite, etc. (optional)</FormLabel><FormControl><Input placeholder="Suite 100" {...field} /></FormControl><FormMessage /></FormItem>
        )}/>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="city" render={({ field }) => (
                <FormItem><FormLabel>City</FormLabel><FormControl><Input placeholder="Anytown" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="area" render={({ field }) => (
                <FormItem><FormLabel>Area / District (optional)</FormLabel><FormControl><Input placeholder="e.g. Downtown" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <FormField control={form.control} name="state" render={({ field }) => (
                <FormItem><FormLabel>State / Province (optional)</FormLabel><FormControl><Input placeholder="CA" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="zip" render={({ field }) => (
                <FormItem><FormLabel>ZIP / Postal Code</FormLabel><FormControl><Input placeholder="12345" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <FormField control={form.control} name="country" render={({ field }) => (
                <FormItem><FormLabel>Country</FormLabel><FormControl><Input placeholder="USA" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
        </div>
        
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Address
        </Button>
      </form>
    </Form>
  );
}
