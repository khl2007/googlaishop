
"use client";

import React from "react";
import { useForm, type SubmitHandler, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { ShippingMethod } from "@/lib/types";
import { Loader2, PlusCircle, Trash, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Switch } from "../ui/switch";

const overrideSchema = z.object({
  type: z.enum(['city', 'area']),
  locationId: z.coerce.number().min(1, "Please select a location."),
  cost: z.coerce.number().min(0, "Cost must be a positive number."),
});

const formSchema = z.discriminatedUnion("cost_type", [
  // Schema for when cost_type is 'weight'
  z.object({
    cost_type: z.literal("weight"),
    title: z.string().min(2, "Title is required."),
    logo: z.string().url().optional().or(z.literal('')),
    enabled: z.boolean().default(false),
    cost_per_kg: z.coerce.number({ required_error: "Cost per KG is required." }).min(0, "Cost cannot be negative."),
    overrides: z.array(overrideSchema).optional(), // Keep overrides here to not lose data
  }),
  // Schema for when cost_type is 'city' or 'area'
  z.object({
    cost_type: z.enum(["city", "area"]),
    title: z.string().min(2, "Title is required."),
    logo: z.string().url().optional().or(z.literal('')),
    enabled: z.boolean().default(false),
    default_cost: z.coerce.number({ required_error: "Default Cost is required." }).min(0, "Cost cannot be negative."),
    overrides: z.array(overrideSchema).optional(),
  }),
]);


type ShippingFormValues = z.infer<typeof formSchema>;

interface City { id: number; name: string; country_name: string; }
interface Area { id: number; name: string; city_name: string; country_name: string; }

interface ShippingFormProps {
  method?: ShippingMethod;
  cities: City[];
  areas: Area[];
}

export function ShippingForm({ method, cities, areas }: ShippingFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEditMode = !!method;
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const isInitialRender = React.useRef(true);
  
  const parsedConfig = method?.config ? JSON.parse(method.config) : {};

  const form = useForm<ShippingFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: method?.title || "",
      logo: method?.logo || "",
      enabled: method?.enabled || false,
      cost_type: method?.cost_type || "city",
      default_cost: method?.default_cost ?? undefined,
      cost_per_kg: parsedConfig.cost_per_kg ?? undefined,
      overrides: parsedConfig.overrides || [],
    } as any, 
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "overrides" as any, 
  });
  
  const watchedCostType = form.watch("cost_type");
  const { setValue, clearErrors } = form;
  const [logoPreview, setLogoPreview] = React.useState<string | null>(method?.logo || null);

  React.useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    
    if (watchedCostType === 'weight') {
      setValue('default_cost', undefined as any);
      clearErrors('default_cost' as any);
    } else {
      setValue('cost_per_kg', undefined as any);
      clearErrors('cost_per_kg' as any);
    }
  }, [watchedCostType, setValue, clearErrors]);

  const onSubmit: SubmitHandler<ShippingFormValues> = async (data) => {
    let config = {};
    let finalDefaultCost: number | null = null;
    
    if (data.cost_type === 'weight') {
        config = { cost_per_kg: data.cost_per_kg };
        finalDefaultCost = null;
    } else {
        const relevantOverrides = (data.overrides || []).filter(o => o.type === data.cost_type);
        config = { overrides: relevantOverrides };
        finalDefaultCost = data.default_cost;
    }

    const payload = {
        title: data.title,
        logo: data.logo,
        enabled: data.enabled,
        cost_type: data.cost_type,
        default_cost: finalDefaultCost,
        config: JSON.stringify(config),
    };

    try {
      const response = await fetch(
        isEditMode ? `/api/admin/shipping/${method.id}` : "/api/admin/shipping",
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
        description: `Shipping method ${isEditMode ? 'updated' : 'created'} successfully.`,
      });
      router.push("/admin/shipping");
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-4xl">
        <Card>
            <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
            <CardContent className="space-y-6">
                <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="e.g., Express Shipping" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="logo" render={({ field: { onChange, value, ...fieldProps }}) => (
                    <FormItem>
                        <FormLabel>Logo</FormLabel>
                        {logoPreview && (
                            <div className="relative mt-2 h-20 w-40 border rounded-md p-2">
                                <Image src={logoPreview} alt="Logo preview" layout="fill" className="object-contain" />
                                <Button type="button" variant="ghost" size="icon" className="absolute -top-3 -right-3 h-6 w-6" onClick={() => {
                                    onChange("");
                                    setLogoPreview(null);
                                    if (fileInputRef.current) fileInputRef.current.value = "";
                                }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                            </div>
                        )}
                        <FormControl>
                            <Input
                                {...fieldProps}
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            const dataUrl = reader.result as string;
                                            onChange(dataUrl);
                                            setLogoPreview(dataUrl);
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                            />
                        </FormControl>
                        <FormDescription>Upload a logo for the shipping provider.</FormDescription>
                        <FormMessage />
                    </FormItem>
                )} />
                 <FormField control={form.control} name="enabled" render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <FormLabel className="text-base">Enable Method</FormLabel>
                            <FormDescription>Make this shipping method available at checkout.</FormDescription>
                        </div>
                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                )} />
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Cost Calculation</CardTitle>
                <CardDescription>Define how the shipping cost will be calculated.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <FormField control={form.control} name="cost_type" render={({ field }) => (
                    <FormItem><FormLabel>Calculation Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a calculation type" /></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="city">Fixed price per city</SelectItem>
                            <SelectItem value="area">Fixed price per area</SelectItem>
                            <SelectItem value="weight">Based on product weight</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )} />

                {watchedCostType === 'weight' && 'cost_per_kg' in form.watch() && (
                    <FormField control={form.control} name="cost_per_kg" render={({ field }) => (
                        <FormItem><FormLabel>Cost per KG</FormLabel><FormControl><Input type="number" step="0.01" placeholder="2.50" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                    )} />
                )}
                {(watchedCostType === 'city' || watchedCostType === 'area') && 'default_cost' in form.watch() && (
                    <>
                        <FormField control={form.control} name="default_cost" render={({ field }) => (
                            <FormItem><FormLabel>Default Cost</FormLabel><FormControl><Input type="number" step="0.01" placeholder="10.00" {...field} value={field.value ?? ''} /></FormControl>
                            <FormDescription>This cost will be applied if no specific override matches.</FormDescription><FormMessage /></FormItem>
                        )} />

                        <div>
                            <h3 className="text-lg font-medium mb-2">Cost Overrides (Optional)</h3>
                            <div className="space-y-4">
                                {fields.map((field, index) => (
                                    field.type === watchedCostType && (
                                        <div key={field.id} className="flex items-end gap-4 p-4 border rounded-md">
                                            <FormField control={form.control} name={`overrides.${index}.locationId`} render={({ field: selectField }) => (
                                                <FormItem className="flex-1">
                                                    <FormLabel>{watchedCostType === 'city' ? 'City' : 'Area'}</FormLabel>
                                                    <Select onValueChange={selectField.onChange} defaultValue={String(selectField.value)}>
                                                        <FormControl><SelectTrigger><SelectValue placeholder={`Select a ${watchedCostType}`} /></SelectTrigger></FormControl>
                                                        <SelectContent>
                                                            {watchedCostType === 'city' && cities.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}, {c.country_name}</SelectItem>)}
                                                            {watchedCostType === 'area' && areas.map(a => <SelectItem key={a.id} value={String(a.id)}>{a.name}, {a.city_name}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                     <FormMessage />
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name={`overrides.${index}.cost`} render={({ field: inputField }) => (
                                                <FormItem>
                                                    <FormLabel>Cost</FormLabel>
                                                    <FormControl><Input type="number" step="0.01" placeholder="5.00" {...inputField} value={inputField.value ?? ''} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                            <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}><Trash className="h-4 w-4" /></Button>
                                        </div>
                                    )
                                ))}
                                <Button type="button" variant="outline" size="sm" onClick={() => append({ type: watchedCostType, locationId: 0, cost: 0 })}>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Add Override
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditMode ? "Save Changes" : "Create Method"}
        </Button>
      </form>
    </Form>
  );
}
