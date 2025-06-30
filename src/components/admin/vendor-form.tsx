
"use client";

import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Home, Trash } from "lucide-react";
import type { Role } from "@/lib/types";
import Link from "next/link";
import React from "react";
import Image from "next/image";

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
  logo: z.string().optional().or(z.literal('')),
});

type VendorFormValues = z.infer<typeof formSchema>;

interface VendorFormProps {
  vendor?: VendorData;
  roles: Role[];
}

export function VendorForm({ vendor, roles }: VendorFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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

  const [logoPreview, setLogoPreview] = React.useState<string | null>(vendor?.logo || null);
  
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

        <FormItem>
            <FormLabel>Company Logo</FormLabel>
            {logoPreview && (
                <div className="relative mt-2 h-32 w-32">
                    <Image
                        src={logoPreview}
                        alt="Logo preview"
                        fill
                        className="rounded-md border object-contain"
                    />
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        onClick={() => {
                            form.setValue('logo', '');
                            setLogoPreview(null);
                            if (fileInputRef.current) {
                                fileInputRef.current.value = '';
                            }
                        }}
                    >
                        <Trash className="h-3 w-3" />
                    </Button>
                </div>
            )}
            <FormControl>
                <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                            if (file.size > 2 * 1024 * 1024) { // 2MB
                                toast({
                                    title: "File too large",
                                    description: "Please upload an image smaller than 2MB.",
                                    variant: "destructive",
                                });
                                return;
                            }
                            const reader = new FileReader();
                            reader.onloadend = () => {
                                const dataUrl = reader.result as string;
                                form.setValue('logo', dataUrl, { shouldValidate: true });
                                setLogoPreview(dataUrl);
                            };
                            reader.readAsDataURL(file);
                        }
                    }}
                />
            </FormControl>
            <FormDescription>Upload an image file (PNG, JPG, etc.). Max 2MB.</FormDescription>
            <FormMessage>{form.formState.errors.logo?.message}</FormMessage>
        </FormItem>
        
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
