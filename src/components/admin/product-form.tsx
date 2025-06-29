
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

const optionValueSchema = z.object({
  id: z.string().optional(),
  value: z.string().min(1, "Option value is required."),
  image: z.string().url("Must be a valid URL.").optional(),
  color_hex: z.string().optional(),
});

const optionGroupSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Group name cannot be empty."),
  options: z.array(optionValueSchema).min(1, "At least one option is required."),
});

const variantSchema = z.object({
  options: z.record(z.string()).refine(val => Object.keys(val).length > 0, {
    message: "At least one option must be selected for the variant.",
  }).optional(),
  price: z.preprocess((a) => parseFloat(z.string().parse(a)), z.number().positive("Price must be positive.")),
  stock: z.preprocess((a) => parseInt(z.string().parse(a), 10), z.number().int().min(0, "Stock can't be negative.")),
  image: z.string().url("Image URL is required.").optional(),
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
      optionGroups: product?.optionGroups ? JSON.parse(product.optionGroups) : [],
      variants: product?.variants.map(v => ({
          ...v,
          options: typeof v.options === 'string' ? JSON.parse(v.options) : v.options,
      })) || [{ options: {}, price: 0, stock: 0 }],
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
        optionGroups: data.optionGroups ? JSON.stringify(data.optionGroups) : "[]",
        variants: data.variants.map(v => {
            const optionValues = v.options ? Object.values(v.options) : [];
            const variantName = optionValues.length > 0 ? optionValues.join(' / ') : data.name;
            return {
                ...v,
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
          headers: { "Content-Type": "application/json" },
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
                 {isEditMode ? (
                     <p className="text-sm text-muted-foreground">Variant editing is not supported. To change variants, please delete and recreate the product.</p>
                 ) : (
                    <>
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
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue placeholder={`Select ${group.name.toLowerCase()}`} /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        {group.options.map((option) => (
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
                                    <FormItem className={hasOptionGroups ? "md:col-span-2" : ""}>
                                      <FormLabel>Image URL (Optional)</FormLabel>
                                      <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                                      <FormMessage />
                                    </FormItem>
                                )}/>
                           </div>
                        </Card>
                    ))}
                    <Button type="button" variant="outline" onClick={() => appendVariant({ options: {}, price: 0, stock: 0, image: '' })}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Variant
                    </Button>
                    </>
                 )}
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
