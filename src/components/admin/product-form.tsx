
"use client";

import React from "react";
import { useForm, useFieldArray, type SubmitHandler, useFormContext } from "react-hook-form";
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
import { Switch } from "../ui/switch";
import { getCsrfToken } from "@/lib/csrf";

const optionValueSchema = z.object({
  id: z.string().optional(),
  value: z.string().min(1, "Option value is required."),
  image: z.string().url("Must be a valid URL.").optional().or(z.literal('')),
  color_hex: z.string().optional(),
});

const optionGroupSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Group name cannot be empty."),
  options: z.array(optionValueSchema).min(1, "At least one option is required."),
});

const variantSchema = z.object({
  id: z.string().optional(),
  options: z.record(z.string()).refine(val => Object.keys(val).length > 0, {
    message: "At least one option must be selected for the variant.",
  }).optional(),
  price: z.preprocess((a) => parseFloat(z.string().parse(a)), z.number().positive("Price must be positive.")),
  stock: z.preprocess((a) => parseInt(z.string().parse(a), 10), z.number().int().min(0, "Stock can't be negative.")),
  image: z.string().url("Must be a valid URL.").optional().or(z.literal('')),
});


const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  slug: z.string().min(2, "Slug must be at least 2 characters.").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase and contain only letters, numbers, and hyphens."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  categoryId: z.string().min(1, "Please select a category."),
  vendorId: z.string().min(1, "Please select a vendor."),
  optionGroups: z.array(optionGroupSchema).optional(),
  variants: z.array(variantSchema).min(1, "At least one product variant is required."),
  tags: z.string().optional(),
  isFeatured: z.boolean().default(false),
  isOnOffer: z.boolean().default(false),
  weight: z.preprocess(
    (a) => (a === "" || a === undefined) ? undefined : parseFloat(z.string().parse(a)),
    z.number().min(0).optional()
  ),
  dimensions: z.string().optional(),
});

type ProductFormValues = z.infer<typeof formSchema>;

interface Vendor {
    id: number;
    fullName: string;
}

interface ProductFormProps {
  product?: Product;
  categories: Category[];
  vendors: Vendor[];
}

export function ProductForm({ product, categories, vendors }: ProductFormProps) {
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
      vendorId: product?.vendorId?.toString() || "",
      optionGroups: product?.optionGroups ? JSON.parse(product.optionGroups) : [],
      variants: product?.variants.map(v => ({
          id: v.id,
          ...v,
          options: typeof v.options === 'string' ? JSON.parse(v.options) : v.options,
          price: v.price || 0,
          stock: v.stock || 0,
      })) || [{ options: {}, price: 0, stock: 0 }],
      tags: product?.tags || "",
      isFeatured: product?.isFeatured || false,
      isOnOffer: product?.isOnOffer || false,
      weight: product?.weight ?? undefined,
      dimensions: product?.dimensions || "",
    },
  });

  const { fields: groupFields, append: appendGroup, remove: removeGroup } = useFieldArray({
    control: form.control,
    name: "optionGroups",
  });
  
  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control: form.control,
    name: "variants",
  });
  
  const watchedGroups = form.watch('optionGroups');


  const isSubmitting = form.formState.isSubmitting;

  const onSubmit: SubmitHandler<ProductFormValues> = async (data) => {
    // Manually check if any variant has empty options
    if (data.optionGroups && data.optionGroups.length > 0) {
        for (const variant of data.variants) {
            if (!variant.options || Object.keys(variant.options).length !== data.optionGroups.length) {
                toast({
                    title: "Incomplete Variant",
                    description: "Please select an option for each group in all variants.",
                    variant: "destructive",
                });
                return;
            }
        }
    }


    const transformedData = {
        ...data,
        vendorId: parseInt(data.vendorId),
        optionGroups: data.optionGroups ? JSON.stringify(data.optionGroups) : "[]",
        variants: data.variants.map(v => {
            const optionValues = v.options ? Object.values(v.options) : [];
            const variantName = optionValues.length > 0 ? optionValues.join(' / ') : data.name;
            return {
                ...v,
                id: v.id,
                name: variantName,
                options: JSON.stringify(v.options || {})
            }
        })
    };
    
    try {
      const response = await fetch(
        isEditMode ? `/api/admin/products/${product.id}` : "/api/admin/products",
        {
          method: isEditMode ? "PUT" : "POST",
          headers: { 
            "Content-Type": "application/json",
            "x-csrf-token": getCsrfToken(),
          },
          body: JSON.stringify(transformedData),
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
  
  const hasOptionGroups = watchedGroups && watchedGroups.length > 0;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
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
                </CardContent>
            </Card>

            <Card>
            <CardHeader>
                <CardTitle>Product Options</CardTitle>
                <FormDescription>
                Define groups of options for your product, like 'Color' or 'Size'. If your product has no options, you can skip this.
                </FormDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {groupFields.map((groupField, groupIndex) => (
                <Card key={groupField.id}>
                    <CardHeader className="flex flex-row items-center justify-between py-4">
                    <h3 className="font-semibold">Option Group</h3>
                    {!isEditMode && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeGroup(groupIndex)}>
                            <Trash className="h-4 w-4 text-destructive" />
                        </Button>
                    )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                    <FormField
                        control={form.control}
                        name={`optionGroups.${groupIndex}.name`}
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Group Name</FormLabel>
                            <FormControl>
                            <Input placeholder="e.g., Color" {...field} disabled={isEditMode} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <OptionValuesArray groupIndex={groupIndex} isEditMode={isEditMode} />
                    </CardContent>
                </Card>
                ))}
                {!isEditMode && (
                    <Button type="button" variant="outline" onClick={() => appendGroup({ name: '', options: [{ value: '' }] })}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Option Group
                    </Button>
                )}
                {isEditMode && <p className="text-sm text-muted-foreground">Option groups cannot be changed after creation to maintain variant consistency.</p>}
            </CardContent>
            </Card>
            
            <Card>
                <CardHeader><CardTitle>Variants</CardTitle>
                <FormDescription>
                {hasOptionGroups 
                    ? "Add and configure each product variant based on the option groups you created."
                    : "Configure the details for your standard product."
                }
                </FormDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {variantFields.map((variantField, index) => (
                        <Card key={variantField.id} className="p-4 space-y-4 relative">
                            <div className="absolute top-2 right-2">
                            {variantFields.length > 1 && (
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeVariant(index)}>
                                    <Trash className="h-4 w-4 text-destructive" />
                                </Button>
                            )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {hasOptionGroups && watchedGroups.map((group) => (
                                    <FormField
                                        key={`${variantField.id}-${group.name}`}
                                        control={form.control}
                                        name={`variants.${index}.options.${group.name}`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{group.name}</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isEditMode}>
                                                    <FormControl><SelectTrigger><SelectValue placeholder={`Select ${group.name.toLowerCase()}`} /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        {group.options.filter(o => o.value).map((option) => (
                                                            <SelectItem key={option.value} value={option.value}>{option.value}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                ))}

                                <FormField control={form.control} name={`variants.${index}.price`} render={({ field }) => (
                                    <FormItem><FormLabel>Price</FormLabel><FormControl><Input type="number" step="0.01" placeholder="99.99" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name={`variants.${index}.stock`} render={({ field }) => (
                                    <FormItem><FormLabel>Stock</FormLabel><FormControl><Input type="number" placeholder="100" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name={`variants.${index}.image`} render={({ field }) => (
                                    <FormItem className={hasOptionGroups ? "md:col-span-2 lg:col-span-4" : "col-span-1 md:col-span-2 lg:col-span-4"}>
                                        <FormLabel>Image URL (Optional)</FormLabel>
                                        <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                            </div>
                        </Card>
                    ))}
                    {!isEditMode && (
                    <Button type="button" variant="outline" onClick={() => appendVariant({ options: {}, price: 0, stock: 0, image: '' })}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Variant
                    </Button>
                    )}
                     {isEditMode && variantFields.length > 1 && (
                      <p className="text-sm text-muted-foreground">Adding/removing variants is disabled in edit mode. You can adjust price, stock, and image for existing variants.</p>
                     )}
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-1 space-y-8">
            <Card>
                <CardHeader><CardTitle>Organization</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <FormField control={form.control} name="vendorId" render={({ field }) => (
                        <FormItem><FormLabel>Vendor</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select a vendor" /></SelectTrigger></FormControl>
                            <SelectContent>{vendors.map((v) => (<SelectItem key={v.id} value={String(v.id)}>{v.fullName}</SelectItem>))}</SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
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
                    <FormField control={form.control} name="tags" render={({ field }) => (
                        <FormItem><FormLabel>Tags</FormLabel><FormControl><Input placeholder="e.g. new, sale, featured" {...field} /></FormControl><FormDescription>Comma-separated tags.</FormDescription><FormMessage /></FormItem>
                    )} />
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Status</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                     <FormField
                        control={form.control}
                        name="isFeatured"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                                <FormLabel>Featured Product</FormLabel>
                                <FormDescription>Display this product on the homepage.</FormDescription>
                            </div>
                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="isOnOffer"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                                <FormLabel>On Offer</FormLabel>
                                <FormDescription>Display a sale badge on this product.</FormDescription>
                            </div>
                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Shipping</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <FormField control={form.control} name="weight" render={({ field }) => (
                        <FormItem><FormLabel>Weight (kg)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="0.5" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="dimensions" render={({ field }) => (
                        <FormItem><FormLabel>Dimensions (L x W x H)</FormLabel><FormControl><Input placeholder="e.g. 20cm x 15cm x 5cm" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </CardContent>
            </Card>
        </div>
        
        <div className="lg:col-span-3">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? "Save Changes" : "Create Product"}
            </Button>
        </div>
      </form>
    </Form>
  );
}

function OptionValuesArray({ groupIndex, isEditMode }: { groupIndex: number, isEditMode: boolean }) {
  const { control } = useFormContext<ProductFormValues>();
  const { fields, append, remove } = useFieldArray({
    control: control,
    name: `optionGroups.${groupIndex}.options`,
  });

  return (
    <div className="space-y-4">
        <FormLabel>Options</FormLabel>
        {fields.map((field, optionIndex) => (
            <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 border p-4 rounded-md relative">
            <FormField
                control={control}
                name={`optionGroups.${groupIndex}.options.${optionIndex}.value`}
                render={({ field }) => (
                <FormItem>
                    <FormLabel className="text-xs">Option Value</FormLabel>
                    <FormControl>
                    <Input placeholder="e.g., Red" {...field} disabled={isEditMode} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={control}
                name={`optionGroups.${groupIndex}.options.${optionIndex}.image`}
                render={({ field }) => (
                <FormItem>
                    <FormLabel className="text-xs">Image URL (Optional)</FormLabel>
                    <FormControl>
                    <Input placeholder="https://..." {...field} disabled={isEditMode} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={control}
                name={`optionGroups.${groupIndex}.options.${optionIndex}.color_hex`}
                render={({ field }) => (
                <FormItem>
                    <FormLabel className="text-xs">Color (Optional)</FormLabel>
                    <FormControl>
                    <div className="flex items-center gap-2">
                        <Input type="color" {...field} value={field.value ?? ''} className="w-12 h-10 p-1" disabled={isEditMode} />
                        <Input type="text" placeholder="#RRGGBB" {...field} value={field.value ?? ''} disabled={isEditMode} />
                    </div>
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />

            {!isEditMode && (
                <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => remove(optionIndex)}>
                <Trash className="h-4 w-4 text-destructive" />
                </Button>
            )}
            </div>
        ))}
       {!isEditMode && (
        <Button type="button" variant="outline" size="sm" onClick={() => append({ value: '' })}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Option
        </Button>
       )}
    </div>
  );
}
