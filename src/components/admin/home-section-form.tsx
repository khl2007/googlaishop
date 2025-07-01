
"use client";

import React from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { getCsrfToken } from "@/lib/csrf";
import type { HomeSection } from "@/lib/types";
import { MultiSelect } from "@/components/ui/multi-select";

interface FormOptions {
  categories: { value: string; label: string }[];
  tags: { value: string; label: string }[];
  products: { value: string; label: string }[];
  sliderGroups: { value: string; label: string }[];
}

interface HomeSectionFormProps {
  section: HomeSection | null;
  formOptions: FormOptions;
  onFormSubmit: (data: HomeSection) => void;
  sectionCount: number;
}

const formSchema = z.object({
  title: z.string().min(2, "Title is required."),
  type: z.enum(['category', 'tag', 'ai', 'custom', 'featured', 'on_offer', 'slider_group']),
  config: z.any().optional(),
  style: z.string().min(1, "Style is required."),
  isActive: z.boolean().default(false),
}).refine(data => {
    if (data.type === 'slider_group') {
        return typeof data.config === 'string' && data.config.length > 0;
    }
    return true;
}, {
    message: "A slider group must be selected.",
    path: ["config"],
});

type FormValues = z.infer<typeof formSchema>;

export function HomeSectionForm({ section, formOptions, onFormSubmit, sectionCount }: HomeSectionFormProps) {
  const { toast } = useToast();
  const isEditMode = !!section;
  
  let initialConfig: any;
  if (section?.type === 'slider_group') {
      initialConfig = section.config;
  } else {
      initialConfig = section?.config ? JSON.parse(section.config) : [];
  }

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: section?.title || "",
      type: section?.type || 'category',
      style: section?.style || 'style1',
      isActive: section?.isActive || false,
      config: initialConfig,
    },
  });

  const watchedType = form.watch("type");
  
  React.useEffect(() => {
    form.setValue('config', undefined);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedType]);


  const handleSubmit: SubmitHandler<FormValues> = async (data) => {
    const payload = {
        ...data,
        config: data.type === 'slider_group' ? data.config : JSON.stringify(data.config || []),
        order: section?.order || sectionCount + 1,
    };

    try {
      const response = await fetch(
        isEditMode ? `/api/admin/home-sections/${section.id}` : "/api/admin/home-sections",
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
      const result = await response.json();
      
      toast({
        title: "Success",
        description: `Section ${isEditMode ? 'updated' : 'created'}.`,
      });

      // To get the full object back on create
      const finalData = isEditMode ? {...section, ...payload, config: data.config } : result;
      onFormSubmit(finalData);

    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const renderConfigField = () => {
    const multiSelectFields = {
        category: {
            placeholder: "Select categories...",
            options: formOptions.categories,
            description: "Select one or more categories to display products from."
        },
        tag: {
            placeholder: "Select tags...",
            options: formOptions.tags,
            description: "Select one or more tags to display products."
        },
        custom: {
            placeholder: "Select products...",
            options: formOptions.products,
            description: "Select specific products to display."
        }
    };
    
    if (Object.keys(multiSelectFields).includes(watchedType)) {
        const details = multiSelectFields[watchedType as keyof typeof multiSelectFields];
        return (
           <FormField
              control={form.control}
              name="config"
              render={({ field }) => (
                  <FormItem>
                      <FormLabel>Configuration</FormLabel>
                      <FormControl>
                          <MultiSelect
                              {...details}
                              value={field.value || []}
                              onChange={field.onChange}
                          />
                      </FormControl>
                      <FormDescription>
                         {details.description}
                      </FormDescription>
                      <FormMessage />
                  </FormItem>
              )}
          />
        );
    }
    
    if (watchedType === 'slider_group') {
        return (
            <FormField
                control={form.control}
                name="config"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Slider Group</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select a slider group" /></SelectTrigger></FormControl>
                            <SelectContent>
                                {formOptions.sliderGroups.map(sg => <SelectItem key={sg.value} value={sg.value}>{sg.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <FormDescription>Select a pre-configured slider group to display in this section.</FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
        );
    }

    return null;
}

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField control={form.control} name="title" render={({ field }) => (
            <FormItem><FormLabel>Section Title</FormLabel><FormControl><Input placeholder="e.g., Top Picks" {...field} /></FormControl><FormMessage /></FormItem>
        )}/>
        
        <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="type" render={({ field }) => (
                <FormItem><FormLabel>Section Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                        <SelectItem value="featured">Featured Products</SelectItem>
                        <SelectItem value="on_offer">Products on Offer</SelectItem>
                        <SelectItem value="category">By Category</SelectItem>
                        <SelectItem value="tag">By Tag</SelectItem>
                        <SelectItem value="custom">Custom Products</SelectItem>
                        <SelectItem value="ai">AI Recommended</SelectItem>
                        <SelectItem value="slider_group">Slider Group</SelectItem>
                    </SelectContent>
                </Select>
                <FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="style" render={({ field }) => (
                <FormItem><FormLabel>Display Style</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                        <SelectItem value="style1">Horizontal Scroll</SelectItem>
                    </SelectContent>
                </Select>
                <FormMessage /></FormItem>
            )} />
        </div>

        {renderConfigField()}

        <FormField control={form.control} name="isActive" render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                    <FormLabel className="text-base">Activate Section</FormLabel>
                    <FormDescription>If inactive, this section will not be shown on the homepage.</FormDescription>
                </div>
                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
            </FormItem>
        )}/>

        <div className="flex justify-end">
            <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? "Save Changes" : "Create Section"}
            </Button>
        </div>
      </form>
    </Form>
  );
}
