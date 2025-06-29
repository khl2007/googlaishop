"use client";

import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const formSchema = z.object({
  websiteTitle: z.string().min(2, "Website title must be at least 2 characters."),
  websiteLogo: z.string().url("Must be a valid URL.").optional().or(z.literal('')),
  timeZone: z.string().min(1, "Please select a time zone."),
  country: z.string().min(1, "Please select a country."),
});

type SettingsFormValues = z.infer<typeof formSchema>;

interface Settings {
    id: number;
    websiteTitle: string;
    websiteLogo: string;
    timeZone: string;
    country: string;
}

interface SettingsFormProps {
  settings: Settings | null;
  timezones: string[];
  countries: string[];
}

export function SettingsForm({ settings, timezones, countries }: SettingsFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      websiteTitle: settings?.websiteTitle || "",
      websiteLogo: settings?.websiteLogo || "",
      timeZone: settings?.timeZone || "UTC",
      country: settings?.country || "USA",
    },
  });
  
  const isSubmitting = form.formState.isSubmitting;

  const onSubmit: SubmitHandler<SettingsFormValues> = async (data) => {
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Something went wrong");
      }
      
      toast({
        title: "Success",
        description: "Settings updated successfully.",
      });
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
    <Card className="max-w-4xl">
        <CardHeader>
            <CardTitle>General Settings</CardTitle>
        </CardHeader>
        <CardContent>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                control={form.control}
                name="websiteTitle"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Website Title</FormLabel>
                    <FormControl>
                        <Input placeholder="Your Awesome Store" {...field} />
                    </FormControl>
                    <FormDescription>The title that appears in the browser tab.</FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="websiteLogo"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Website Logo URL</FormLabel>
                    <FormControl>
                        <Input placeholder="https://example.com/logo.png" {...field} />
                    </FormControl>
                    <FormDescription>The URL of your store's logo.</FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="timeZone"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Time Zone</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a time zone" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {timezones.map((tz) => (
                            <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Default Country</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a country" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {countries.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormDescription>The default country for shipping and taxes.</FormDescription>
                    <FormMessage />
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
