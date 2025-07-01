"use client";

import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { getCsrfToken } from "@/lib/csrf";
import type { SliderGroup } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { MultiSelect } from "@/components/ui/multi-select";

interface FormOptions {
  categories: { value: string; label: string }[];
  tags: { value: string; label: string }[];
}

interface SliderGroupFormProps {
  sliderGroup?: SliderGroup;
  formOptions: FormOptions;
}

const formSchema = z.object({
  name: z.string().min(2, "Name is required."),
  location: z.enum(['category_top']),
  category_id: z.string().min(1, "Please select a category."),
  content_type: z.enum(['product_tag']),
  tags: z.array(z.string()).min(1, "At least one tag is required."),
  slides_per_view: z.coerce.number().min(1, "Must show at least 1 slide."),
  autoplay_speed: z.coerce.number().int().min(1000, "Speed must be at least 1000ms."),
  style: z.string().min(1, "Style is required."),
  is_active: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

export function SliderGroupForm({ sliderGroup, formOptions }: SliderGroupFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEditMode = !!sliderGroup;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: sliderGroup?.name || "",
      location: sliderGroup?.location || 'category_top',
      category_id: sliderGroup?.category_id || undefined,
      content_type: sliderGroup?.content_type || 'product_tag',
      tags: sliderGroup?.tags ? JSON.parse(sliderGroup.tags) : [],
      slides_per_view: sliderGroup?.slides_per_view || 2.5,
      autoplay_speed: sliderGroup?.autoplay_speed || 5000,
      style: sliderGroup?.style || 'default',
      is_active: sliderGroup?.is_active || false,
    },
  });

  const handleSubmit: SubmitHandler<FormValues> = async (data) => {
    const payload = {
        ...data,
        tags: JSON.stringify(data.tags || []),
    };

    try {
      const response = await fetch(
        isEditMode ? `/api/admin/slider-groups/${sliderGroup.id}` : "/api/admin/slider-groups",
        {
          method: isEditMode ? "PUT" : "POST",
          headers: { 
            "Content-Type": "application/json",
            "x-csrf-token": getCsrfToken(),
          },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) throw new Error(await response.text());
      
      toast({
        title: "Success",
        description: `Slider Group ${isEditMode ? 'updated' : 'created'}.`,
      });
      router.push('/admin/slider-groups');
      router.refresh();

    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 max-w-2xl">
        <Card>
            <CardHeader><CardTitle>Configuration</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Group Name</FormLabel><FormControl><Input placeholder="e.g., Hot Deals on Phones" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="location" render={({ field }) => (
                    <FormItem><FormLabel>Display Location</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent><SelectItem value="category_top">Top of Category Page</SelectItem></SelectContent>
                    </Select><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="category_id" render={({ field }) => (
                    <FormItem><FormLabel>Target Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                        <SelectContent>{formOptions.categories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                    </Select><FormMessage /></FormItem>
                )} />
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader><CardTitle>Content</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                 <FormField control={form.control} name="content_type" render={({ field }) => (
                    <FormItem><FormLabel>Content Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent><SelectItem value="product_tag">Products by Tag</SelectItem></SelectContent>
                    </Select><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="tags" render={({ field }) => (
                    <FormItem><FormLabel>Product Tags</FormLabel>
                    <FormControl>
                        <MultiSelect
                            placeholder="Select tags..."
                            options={formOptions.tags}
                            value={field.value}
                            onChange={field.onChange}
                        />
                    </FormControl>
                    <FormDescription>Select product tags to show in the slider.</FormDescription>
                    <FormMessage /></FormItem>
                )}/>
            </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle>Appearance & Behavior</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <FormField control={form.control} name="slides_per_view" render={({ field }) => (
                    <FormItem><FormLabel>Slides to Show in View</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl>
                    <FormDescription>e.g., 2.5 to show two full slides and part of a third.</FormDescription><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="autoplay_speed" render={({ field }) => (
                    <FormItem><FormLabel>Autoplay Speed (ms)</FormLabel><FormControl><Input type="number" step="100" {...field} /></FormControl>
                    <FormDescription>Time in milliseconds before switching to the next slide. e.g., 5000 for 5 seconds.</FormDescription><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="style" render={({ field }) => (
                    <FormItem><FormLabel>Style</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="default">Default</SelectItem>
                            <SelectItem value="full-bleed">Full Bleed</SelectItem>
                        </SelectContent>
                    </Select><FormMessage /></FormItem>
                )}/>
                 <FormField control={form.control} name="is_active" render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <FormLabel className="text-base">Activate Slider Group</FormLabel>
                            <FormDescription>If inactive, this slider will not be shown.</FormDescription>
                        </div>
                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                )}/>
            </CardContent>
        </Card>

        <div className="flex justify-end">
            <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? "Save Changes" : "Create Slider Group"}
            </Button>
        </div>
      </form>
    </Form>
  );
}
