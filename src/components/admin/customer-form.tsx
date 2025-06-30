
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

interface CustomerData {
    id: number;
    fullName: string;
    username: string;
    phoneNumber: string;
    country: string;
    city: string;
    role_id: number;
}

const baseSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  username: z.string().email("Invalid email address."),
  phoneNumber: z.string().min(5, "Phone number is required."),
  country: z.string().min(2, "Country is required."),
  city: z.string().min(2, "City is required."),
});

const createSchema = baseSchema.extend({
  password: z.string().min(6, "Password must be at least 6 characters."),
});

const updateSchema = baseSchema.extend({
  password: z.string().optional().refine(val => !val || val.length >= 6, {
    message: "Password must be at least 6 characters if provided.",
  }),
});


interface CustomerFormProps {
  customer?: CustomerData;
  roles: Role[];
}

export function CustomerForm({ customer, roles }: CustomerFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEditMode = !!customer;

  // Define the schema and type based on edit mode for clarity and stability
  const formSchema = isEditMode ? updateSchema : createSchema;
  type CustomerFormValues = z.infer<typeof formSchema>;

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: customer?.fullName || "",
      username: customer?.username || "",
      password: "",
      phoneNumber: customer?.phoneNumber || "",
      country: customer?.country || "",
      city: customer?.city || "",
    },
  });
  
  const onFormSubmit: SubmitHandler<CustomerFormValues> = async (data) => {
    const customerRole = roles.find(role => role.name === 'customer');
    if (!customerRole) {
        toast({ title: "Error", description: "Customer role not found.", variant: "destructive" });
        return;
    }

    const payload: any = { 
        ...data, 
        role_id: customerRole.id 
    };

    if (isEditMode && !data.password) {
      delete payload.password;
    }

    try {
      const response = await fetch(
        isEditMode ? `/api/admin/users/${customer.id}` : "/api/admin/users",
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
        description: `Customer ${isEditMode ? 'updated' : 'created'} successfully.`,
      });
      router.push("/admin/customers");
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
      <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-4 max-w-2xl">
        <FormField control={form.control} name="fullName" render={({ field }) => (
            <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>
        )}/>
         <FormField control={form.control} name="username" render={({ field }) => (
            <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="user@example.com" {...field} /></FormControl><FormMessage /></FormItem>
        )}/>
        <FormField control={form.control} name="password" render={({ field }) => (
            <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" placeholder={isEditMode ? "Leave blank to keep current password" : "••••••"} {...field} /></FormControl><FormMessage /></FormItem>
        )}/>
         <FormField control={form.control} name="phoneNumber" render={({ field }) => (
            <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input placeholder="+1 123 456 7890" {...field} /></FormControl><FormMessage /></FormItem>
        )}/>
        <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="country" render={({ field }) => (
                <FormItem><FormLabel>Country</FormLabel><FormControl><Input placeholder="e.g., USA" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="city" render={({ field }) => (
                <FormItem><FormLabel>City</FormLabel><FormControl><Input placeholder="e.g., New York" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
        </div>
        <div className="flex items-center gap-4">
            <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? "Save Changes" : "Create Customer"}
            </Button>

            {isEditMode && (
                <Button variant="outline" asChild>
                    <Link href={`/admin/customers/${customer.id}/addresses`}>
                        <Home className="mr-2 h-4 w-4" />
                        Manage Addresses
                    </Link>
                </Button>
            )}
        </div>
      </form>
    </Form>
  );
}
