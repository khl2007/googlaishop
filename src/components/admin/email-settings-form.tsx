"use client";

import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { getCsrfToken } from "@/lib/csrf";

const formSchema = z.object({
  host: z.string().min(1, "Host is required."),
  port: z.coerce.number().int().min(1, "Port is required."),
  username: z.string().min(1, "Username is required."),
  password: z.string().optional(),
  from_email: z.string().email("Invalid 'From' email address."),
  from_name: z.string().min(1, "From Name is required."),
  secure: z.boolean().default(true),
  provider: z.string().default('smtp'),
});

type EmailSettingsFormValues = z.infer<typeof formSchema>;

interface Settings {
    id: number;
    provider: string;
    host: string;
    port: number;
    username: string;
    password?: string;
    from_email: string;
    from_name: string;
    secure: boolean;
}

interface EmailSettingsFormProps {
  settings: Settings;
}

export function EmailSettingsForm({ settings }: EmailSettingsFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<EmailSettingsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...settings,
      password: '', // Always start with an empty password field for security
    },
  });
  
  const isSubmitting = form.formState.isSubmitting;

  const onSubmit: SubmitHandler<EmailSettingsFormValues> = async (data) => {
    // Only include the password if it's been entered.
    const payload = { ...data };
    if (!payload.password) {
        delete (payload as any).password;
    }

    try {
      const response = await fetch("/api/admin/settings/email", {
        method: "PUT",
        headers: { 
            "Content-Type": "application/json",
            "x-csrf-token": getCsrfToken(),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Something went wrong");
      }
      
      toast({
        title: "Success",
        description: "Email settings updated successfully.",
      });
      router.refresh();
      form.reset({
        ...form.getValues(),
        password: '',
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="max-w-4xl">
        <CardHeader>
            <CardTitle>SMTP Configuration</CardTitle>
            <CardDescription>Enter the details for your SMTP server.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="host"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>SMTP Host</FormLabel>
                                <FormControl><Input placeholder="smtp.example.com" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="port"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>SMTP Port</FormLabel>
                                <FormControl><Input type="number" placeholder="587" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl><Input placeholder="your-email@example.com" autoComplete="off" {...field} /></FormControl>
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
                                <FormControl><Input type="password" placeholder="Leave blank to keep existing password" autoComplete="new-password" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="from_email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>From Email</FormLabel>
                                <FormControl><Input placeholder="noreply@yourstore.com" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="from_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>From Name</FormLabel>
                                <FormControl><Input placeholder="Your Store Name" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <FormField
                    control={form.control}
                    name="secure"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">Use TLS/SSL</FormLabel>
                                <FormDescription>Enable secure connection. Recommended for most providers.</FormDescription>
                            </div>
                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
                </Button>
            </form>
            </Form>
        </CardContent>
    </Card>
  );
}
