
"use client";

import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Home } from "lucide-react";
import type { Role } from "@/lib/types";
import Link from "next/link";

interface VendorData {
    id: number;
    fullName: string;
    username: string;
    phoneNumber: string;
    country: string;
    city: string;
    role_id: number;
    logo?: string | null;
}

// Password is not required for admin vendor management.
const formSchema = z.object({
  fullName: z.string().min(2, "Company name must be at least 2 characters."),
  username: z.string().email("Invalid email address."),
  phoneNumber: z.string().min(5, "Phone number is required."),
  country: z.string().min(2, "Country is required."),
  city: z.string().min(2, "City is required."),
  logo: z.string().url("Must be a valid URL").optional().or(z.literal('')),
});

type VendorFormValues = z.infer<typeof formSchema>;

interface VendorFormProps {
  vendor?: VendorData;
  roles: Role[];
}

export function VendorForm({ vendor, roles }: VendorFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<VendorFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: vendor?.fullName || "",
      username: vendor?.username || "",
      phoneNumber: vendor?.phoneNumber || "",
      country: vendor?.country || "",
      city: vendor?.city || "",
      logo: vendor?.logo || "",
    },
  });
  
  const isSubmitting = form.formState.isSubmitting;
  const isEditMode = !!vendor;

  const onSubmit: SubmitHandler<VendorFormValues> = async (data) => {
    const vendorRole = roles.find(role => role.name === 'vendor');
    if (!vendorRole) {
        toast({ title: "Error", description: "Vendor role not found.", variant: "destructive" });
        return;
    }
    
    const payload = {
        ...data,
        role_id: vendorRole.id,
    };

    try {
      const response = await fetch(
        isEditMode ? `/api/admin/users/${vendor.id}` : "/api/admin/users",
        {
          method: isEditMode ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Something went wrong");
      }
      
      toast({
        title: "Success",
        description: `Vendor ${isEditMode ? 'updated' : 'created'} successfully.`,
      });
      router.push("/admin/vendors");
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
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name</FormLabel>
              <FormControl>
                <Input placeholder="Awesome Gadgets Inc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="logo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Logo URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/logo.png" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="contact@awesome-gadgets.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="+1 123 456 7890" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl>
                    <Input placeholder="e.g., USA" {...field} />
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
                <FormControl>
                    <Input placeholder="e.g., New York" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <div className="flex gap-4 items-center">
            <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? "Save Changes" : "Create Vendor"}
            </Button>
            {isEditMode && (
                <Button variant="outline" asChild>
                    <Link href={`/admin/vendors/${vendor.id}/address`}>
                        <Home className="mr-2 h-4 w-4" />
                        Manage Store Address
                    </Link>
                </Button>
            )}
        </div>
      </form>
    </Form>
  );
}
