"use client";

import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface Role {
  id: number;
  name: string;
}

interface UserData {
    id: number;
    fullName: string;
    username: string;
    phoneNumber: string;
    country: string;
    city: string;
    role_id: number;
}

const formSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  username: z.string().email("Invalid email address."),
  password: z.string().optional(),
  role_id: z.preprocess((a) => parseInt(z.string().parse(a)), z.number().int()),
  phoneNumber: z.string().min(5, "Phone number is required."),
  country: z.string().min(2, "Country is required."),
  city: z.string().min(2, "City is required."),
}).refine(data => {
    // If it's a new user (password is not optional), password must be provided and have a length of at least 6.
    if (!data.password && !('id' in data)) {
        return false;
    }
    if (data.password && data.password.length < 6) {
        return false;
    }
    return true;
}, {
    message: "Password must be at least 6 characters long.",
    path: ["password"],
});


type UserFormValues = z.infer<typeof formSchema>;

interface UserFormProps {
  user?: UserData;
  roles: Role[];
}

export function UserForm({ user, roles }: UserFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<UserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      username: user?.username || "",
      password: "",
      role_id: user?.role_id,
      phoneNumber: user?.phoneNumber || "",
      country: user?.country || "",
      city: user?.city || "",
    },
  });
  
  const isSubmitting = form.formState.isSubmitting;
  const isEditMode = !!user;

  const onSubmit: SubmitHandler<UserFormValues> = async (data) => {
    // Don't send an empty password field
    const payload = data.password ? data : { ...data, password: undefined };

    try {
      const response = await fetch(
        isEditMode ? `/api/admin/users/${user.id}` : "/api/admin/users",
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
        description: `User ${isEditMode ? 'updated' : 'created'} successfully.`,
      });
      router.push("/admin/users");
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
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
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
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="user@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder={isEditMode ? "Leave blank to keep current password" : "••••••"} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="role_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={String(field.value)}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r.id} value={String(r.id)}>{r.name.charAt(0).toUpperCase() + r.name.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditMode ? "Save Changes" : "Create User"}
        </Button>
      </form>
    </Form>
  );
}
