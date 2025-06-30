
"use client";

import { useForm, type SubmitHandler, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Switch } from "../ui/switch";
import { getCsrfToken } from "@/lib/csrf";

const paymentMethodSchema = z.object({
  id: z.number(),
  provider: z.string(),
  enabled: z.boolean(),
  config: z.record(z.string().optional()),
});

const formSchema = z.object({
  methods: z.array(paymentMethodSchema),
});

type PaymentFormValues = z.infer<typeof formSchema>;

interface PaymentMethod {
    id: number;
    provider: string;
    enabled: number; // 0 or 1
    config: Record<string, any>;
}

interface PaymentMethodsFormProps {
  paymentMethods: PaymentMethod[];
}

export function PaymentMethodsForm({ paymentMethods }: PaymentMethodsFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      methods: paymentMethods.map(pm => ({
          ...pm,
          enabled: !!pm.enabled, // Convert 0/1 to boolean
      })),
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "methods",
  });
  
  const isSubmitting = form.formState.isSubmitting;

  const onSubmit: SubmitHandler<PaymentFormValues> = async (data) => {
    const payload = data.methods.map(m => ({
        ...m,
        enabled: m.enabled ? 1 : 0
    }));

    try {
      const response = await fetch("/api/admin/payments", {
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
        description: "Payment methods updated successfully.",
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

  const getProviderTitle = (provider: string) => {
    switch(provider) {
        case 'cash': return 'Cash on Delivery';
        case 'stripe': return 'Stripe';
        case 'paypal': return 'PayPal';
        default: return provider;
    }
  }

  return (
    <Card className="max-w-4xl">
        <CardHeader>
            <CardTitle>Provider Settings</CardTitle>
            <CardDescription>Enable and configure your payment providers.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <Accordion type="multiple" defaultValue={['cash', 'stripe', 'paypal']} className="w-full">
                        {fields.map((field, index) => (
                            <AccordionItem key={field.id} value={field.provider}>
                                <AccordionTrigger className="text-lg font-medium">
                                    {getProviderTitle(field.provider)}
                                </AccordionTrigger>
                                <AccordionContent className="space-y-6 pt-4">
                                     <FormField
                                        control={form.control}
                                        name={`methods.${index}.enabled`}
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-base">Enable {getProviderTitle(field.name.split('.')[2])}</FormLabel>
                                                    <FormDescription>Allow customers to use this payment method.</FormDescription>
                                                </div>
                                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    {field.provider === 'cash' && (
                                        <FormField control={form.control} name={`methods.${index}.config.description`} render={({ field }) => (
                                            <FormItem><FormLabel>Description</FormLabel><FormControl><Input placeholder="Instructions for customer" {...field} /></FormControl><FormMessage /></FormItem>
                                        )}/>
                                    )}

                                    {field.provider === 'stripe' && (
                                        <>
                                            <FormField control={form.control} name={`methods.${index}.config.publishableKey`} render={({ field }) => (
                                                <FormItem><FormLabel>Publishable Key</FormLabel><FormControl><Input placeholder="pk_live_..." {...field} /></FormControl><FormMessage /></FormItem>
                                            )}/>
                                            <FormField control={form.control} name={`methods.${index}.config.secretKey`} render={({ field }) => (
                                                <FormItem><FormLabel>Secret Key</FormLabel><FormControl><Input type="password" placeholder="sk_live_..." {...field} /></FormControl><FormMessage /></FormItem>
                                            )}/>
                                        </>
                                    )}

                                    {field.provider === 'paypal' && (
                                         <FormField control={form.control} name={`methods.${index}.config.clientId`} render={({ field }) => (
                                            <FormItem><FormLabel>PayPal Client ID</FormLabel><FormControl><Input placeholder="A..." {...field} /></FormControl><FormMessage /></FormItem>
                                        )}/>
                                    )}

                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save All Changes
                    </Button>
                </form>
            </Form>
        </CardContent>
    </Card>
  );
}
