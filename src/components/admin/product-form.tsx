
"use client";

import React from "react";
import { useForm, useFieldArray, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import type { Product, Category } from "@/lib/types";
import { Loader2, PlusCircle, Trash } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const variantOptionSchema = z.record(z.string());

const variantSchema = z.object({
  name: z.string(), // This will be derived from options
  price: z.preprocess((a) => parseInt(z.string().parse(a), 10), z.number().positive("Price must be positive.")),
  stock: z.preprocess((a) => parseInt(z.string().parse(a), 10), z.number().int().min(0, "Stock can't be negative.")),
  image: z.string().url("Must be a valid URL.").min(1, "Image URL is required."),
  color_hex: z.string().optional(),
  options: variantOptionSchema.optional(), // Holds { Color: 'Red', Size: 'S' }
});

const optionGroupSchema = z.object({
  name: z.string().min(1, "Group name cannot be empty."),
});

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  slug: z.string().min(2, "Slug must be at least 2 characters.").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase and contain only letters, numbers, and hyphens."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  categoryId: z.string().min(1, "Please select a category."),
  optionGroups: z.array(optionGroupSchema).optional(),
  variants: z.array(variantSchema).min(1, "At least one product variant is required."),
});

type ProductFormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  product?: Product;
  categories: Category[];
}

export function ProductForm({ product, categories }: ProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEditMode = !!product;

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product?.name || "",
      slug: product?.slug || "",
      description: product?.description || "",
      categoryId: product?.categoryId || "",
      optionGroups: product?.optionGroups ? JSON.parse(product.optionGroups).map((name: string) => ({ name })) : [],
      variants: product?.variants.map(v => {
          const groupNames = product?.optionGroups ? JSON.parse(product.optionGroups) : [];
          const optionValues = v.name.split(',').map(s => s.trim());
          const options = groupNames.reduce((acc: any, groupName: string, index: number) => {
              if (groupName) acc[groupName] = optionValues[index] || '';
              return acc;
          }, {});
          return { ...v, options };
      }) || [{ name: "", price: 0, stock: 0, image: "", color_hex: "" , options: {}}],
    },
  });

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control: form.control,
    name: "variants",
  });
  
  const { fields: groupFields, append: appendGroup, remove: removeGroup } = useFieldArray({
    control: form.control,
    name: "optionGroups",
  });

  const watchedGroups = form.watch('optionGroups');
  const watchedVariants = form.watch('variants');

  React.useEffect(() => {
    const groupNames = watchedGroups?.map(g => g.name).filter(Boolean) || [];
    if (groupNames.length > 0) {
      watchedVariants?.forEach((variant, index) => {
        const newName = groupNames
          .map(name => variant.options?.[name] || '')
          .join(', ');
        
        if (form.getValues(`variants.${index}.name`) !== newName) {
          form.setValue(`variants.${index}.name`, newName, { shouldDirty: true });
        }
      });
    }
  }, [watchedVariants, watchedGroups, form]);
  
  const isSubmitting = form.formState.isSubmitting;

  const onSubmit: SubmitHandler<ProductFormValues> = async (data) => {
    const transformedData = {
        ...data,
        optionGroups: data.optionGroups && data.optionGroups.length > 0
          ? JSON.stringify(data.optionGroups.map(g => g.name))
          : null,
        variants: data.variants.map(({ options, ...rest }) => rest),
    };

    const payload = isEditMode 
      ? { ...transformedData, variants: undefined } // Don't update variants in edit mode
      : { ...transformedData, variants: transformedData.variants.map(({...rest}) => rest) };


    try {
      const response = await fetch(
        isEditMode ? `/api/admin/products/${product.id}` : "/api/admin/products",
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
        description: `Product ${isEditMode ? 'updated' : 'created'} successfully.`,
      });
      router.push("/admin/products");
      router.refresh();

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAddNewVariant = () => {
    appendVariant({ name: '', price: 0, stock: 0, image: 'https://placehold.co/600x600.png', color_hex: '', options: {} });
  };
  
  const groupNames = watchedGroups?.map(g => g.name).filter(Boolean) || [];


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-4xl">
        <Card>
            <CardHeader><CardTitle>Product Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Product Name</FormLabel><FormControl><Input placeholder="e.g., AuraPhone X" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="slug" render={({ field }) => (
                    <FormItem><FormLabel>Slug</FormLabel><FormControl><Input placeholder="e.g., auraphone-x" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Describe the product..." {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="categoryId" render={({ field }) => (
                    <FormItem><FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                        <SelectContent>{categories.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}</SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )} />
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Option Groups</CardTitle>
                <FormDescription>Define option groups for your variants, like 'Color' or 'Size'.</FormDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {groupFields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                        <FormField
                            control={form.control}
                            name={`optionGroups.${index}.name`}
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormControl>
                                        <Input placeholder={`Group ${index + 1} Name`} {...field} disabled={isEditMode} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {!isEditMode && (
                          <Button type="button" variant="destructive" size="icon" onClick={() => removeGroup(index)}>
                              <Trash className="h-4 w-4" />
                          </Button>
                        )}
                    </div>
                ))}
                 {!isEditMode && (
                    <Button type="button" variant="outline" onClick={() => appendGroup({ name: '' })} className="mt-2">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Option Group
                    </Button>
                 )}
                 {isEditMode && <p className="text-sm text-muted-foreground">Option groups cannot be changed after creation.</p>}
            </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle>Product Variants</CardTitle></CardHeader>
            <CardContent className="space-y-6">
                {variantFields.map((field, index) => (
                    <div key={field.id} className="space-y-4 border p-4 rounded-lg relative">
                        {groupNames.length > 0 ? (
                            groupNames.map((groupName) => (
                                <FormField
                                    key={groupName}
                                    control={form.control}
                                    name={`variants.${index}.options.${groupName}`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{groupName}</FormLabel>
                                            <FormControl>
                                                <Input placeholder={`Enter ${groupName}`} {...field} disabled={isEditMode} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            ))
                        ) : (
                             <FormField
                                control={form.control}
                                name={`variants.${index}.name`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Variant Name</FormLabel>
                                        <FormControl><Input placeholder="e.g., Standard" {...field} disabled={isEditMode} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name={`variants.${index}.price`} render={({ field }) => (
                                <FormItem><FormLabel>Price</FormLabel><FormControl><Input type="number" placeholder="999" {...field} disabled={isEditMode} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name={`variants.${index}.stock`} render={({ field }) => (
                                <FormItem><FormLabel>Stock</FormLabel><FormControl><Input type="number" placeholder="15" {...field} disabled={isEditMode} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                        <FormField control={form.control} name={`variants.${index}.image`} render={({ field }) => (
                            <FormItem><FormLabel>Image URL</FormLabel><FormControl><Input placeholder="https://placehold.co/600x600" {...field} disabled={isEditMode}/></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name={`variants.${index}.color_hex`} render={({ field }) => (
                           <FormItem>
                             <FormLabel>Color</FormLabel>
                             <FormControl>
                               <div className="flex items-center gap-2">
                                 <Input type="color" {...field} className="w-12 h-10 p-1" disabled={isEditMode} />
                                 <Input type="text" placeholder="#RRGGBB" {...field} value={field.value ?? ''} disabled={isEditMode} />
                               </div>
                             </FormControl>
                             <FormMessage />
                           </FormItem>
                         )} />

                         {!isEditMode && (
                            <Button type="button" variant="destructive" size="icon" className="absolute top-4 right-4" onClick={() => removeVariant(index)}>
                                <Trash className="h-4 w-4" />
                            </Button>
                         )}
                    </div>
                ))}
                 {!isEditMode && (
                    <Button type="button" variant="outline" onClick={handleAddNewVariant}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Variant
                    </Button>
                 )}
                 {isEditMode && <p className="text-sm text-muted-foreground">Variant editing is not supported. To change variants, please delete and recreate the product.</p>}
            </CardContent>
        </Card>
        
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditMode ? "Save Changes" : "Create Product"}
        </Button>
      </form>
    </Form>
  );
}
