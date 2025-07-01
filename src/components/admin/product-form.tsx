
"use client";

import React from "react";
import Image from "next/image";
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
import { Loader2, PlusCircle, Trash, Trash2, Wand2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../ui/card";
import { Switch } from "../ui/switch";
import { getCsrfToken } from "@/lib/csrf";
import { getCrossProduct } from "@/lib/utils";

const variantSchema = z.object({
  id: z.string().optional(),
  options: z.any().optional(),
  price: z.coerce.number({ required_error: "Price is required" }).min(0.01),
  stock: z.coerce.number({ required_error: "Stock is required" }).int().min(0),
  image: z.string().optional().or(z.literal('')),
});

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  slug: z.string().min(2, "Slug must be at least 2 characters.").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase and contain only letters, numbers, and hyphens."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  categoryId: z.string().min(1, "Please select a category."),
  vendorId: z.string().min(1, "Please select a vendor."),
  optionGroups: z.any().optional(),
  variants: z.array(variantSchema).min(1, "At least one product variant is required."),
  tags: z.string().optional(),
  isFeatured: z.boolean().default(false),
  isOnOffer: z.boolean().default(false),
  weight: z.preprocess(
      (val) => (val === "" || val == null ? undefined : val),
      z.coerce.number({ invalid_type_error: "Weight must be a number." }).min(0, "Weight must be non-negative.").optional()
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
      vendorId: product?.vendorId?.toString() ?? "",
      optionGroups: product?.optionGroups ? JSON.parse(product.optionGroups) : [],
      variants: product?.variants.map(v => ({
          ...v,
          id: v.id,
          options: typeof v.options === 'string' ? JSON.parse(v.options) : v.options,
          price: v.price,
          stock: v.stock,
      })) || [{ options: {}, price: 0, stock: 0, image: '' }],
      tags: product?.tags || "",
      isFeatured: !!product?.isFeatured,
      isOnOffer: !!product?.isOnOffer,
      weight: product?.weight ?? undefined,
      dimensions: product?.dimensions || "",
    },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });
  
  const { fields: groupFields, append: appendGroup, remove: removeGroup } = useFieldArray({
    control: form.control,
    name: "optionGroups",
  });
  
  const { fields: variantFields, remove: removeVariant } = useFieldArray({
    control: form.control,
    name: "variants",
  });
  
  const [variantsGenerated, setVariantsGenerated] = React.useState(isEditMode);
  const isSubmitting = form.formState.isSubmitting;
  
  const handleGenerateVariants = () => {
    const optionGroups = form.getValues('optionGroups');
    if (!optionGroups || optionGroups.length === 0) {
      // If no option groups, create a single default variant
      form.setValue('variants', [{ options: {}, price: 0, stock: 0, image: '' }]);
      setVariantsGenerated(true);
      return;
    }

    const validOptionGroups = optionGroups.filter(g => g.name && g.options?.length > 0 && g.options.some(o => o.value));
    
    if (validOptionGroups.length === 0) {
       toast({ title: "No options defined", description: "Please add at least one option group with values to generate variants.", variant: "destructive"});
       return;
    }

    const optionValuesByGroup = validOptionGroups.map(group => {
      return group.options.filter(opt => opt.value).map(opt => ({
        group: group.name,
        value: opt.value,
        image: opt.image || ''
      }));
    });
    
    const combinations = getCrossProduct(...optionValuesByGroup);

    const newVariants = combinations.map(combo => {
        const options: Record<string, string> = {};
        let variantImage = '';
        combo.forEach(opt => {
            options[opt.group] = opt.value;
            if (opt.image) {
              variantImage = opt.image;
            }
        });
        return {
            options: options,
            price: 0,
            stock: 0,
            image: variantImage
        };
    });

    form.setValue('variants', newVariants);
    setVariantsGenerated(true);
    toast({ title: "Variants Generated", description: `${newVariants.length} variants have been created. Now set their prices and stock.` });
  };


  const onSubmit: SubmitHandler<ProductFormValues> = async (data) => {
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
                price: Number(v.price),
                stock: Number(v.stock),
                options: JSON.stringify(v.options || {}),
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
                    Define groups of options for your product, like 'Color' or 'Size'. If your product has no options, you can skip this section and just generate a single variant.
                  </FormDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                  {groupFields.map((groupField, groupIndex) => (
                    <Card key={groupField.id}>
                        <CardHeader className="flex flex-row items-center justify-between py-4">
                          <h3 className="font-semibold">Option Group</h3>
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeGroup(groupIndex)} disabled={variantsGenerated}>
                              <Trash className="h-4 w-4 text-destructive" />
                          </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <FormField control={form.control} name={`optionGroups.${groupIndex}.name`} render={({ field }) => (
                            <FormItem><FormLabel>Group Name</FormLabel><FormControl><Input placeholder="e.g., Color" {...field} disabled={variantsGenerated} /></FormControl><FormMessage /></FormItem>
                          )} />
                          <OptionValuesArray groupIndex={groupIndex} isReadOnly={variantsGenerated} />
                        </CardContent>
                    </Card>
                  ))}
                  <Button type="button" variant="outline" onClick={() => appendGroup({ name: '', options: [{ value: '' }] })} disabled={variantsGenerated}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Option Group
                  </Button>
              </CardContent>
              <CardFooter className="justify-end">
                <Button type="button" onClick={handleGenerateVariants}>
                    <Wand2 className="mr-2 h-4 w-4" />
                    {isEditMode ? 'Regenerate Variants' : 'Generate Variants'}
                </Button>
              </CardFooter>
            </Card>
            
            {variantsGenerated && (
              <Card>
                  <CardHeader><CardTitle>Manage Variants</CardTitle>
                  <FormDescription>
                    Configure the price, stock, and image for each generated variant.
                  </FormDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                      {variantFields.map((variantField, index) => (
                          <Card key={variantField.id} className="p-4 space-y-4 relative">
                              <div className="flex justify-between items-start">
                                <div className="font-semibold text-lg">
                                  {Object.values(form.getValues(`variants.${index}.options`)).join(' / ') || 'Standard Product'}
                                </div>
                                {variantFields.length > 1 && (
                                  <Button type="button" variant="ghost" size="icon" onClick={() => removeVariant(index)}>
                                      <Trash className="h-4 w-4 text-destructive" />
                                  </Button>
                                )}
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <FormField control={form.control} name={`variants.${index}.price`} render={({ field }) => (
                                      <FormItem><FormLabel>Price</FormLabel><FormControl><Input type="number" step="0.01" placeholder="99.99" {...field} /></FormControl><FormMessage /></FormItem>
                                  )}/>
                                  <FormField control={form.control} name={`variants.${index}.stock`} render={({ field }) => (
                                      <FormItem><FormLabel>Stock</FormLabel><FormControl><Input type="number" placeholder="100" {...field} /></FormControl><FormMessage /></FormItem>
                                  )}/>
                                  <FormField control={form.control} name={`variants.${index}.image`} render={({ field: { onChange, value, ...rest } }) => {
                                      const fileInputRef = React.useRef<HTMLInputElement>(null);
                                      return (
                                          <FormItem>
                                              <FormLabel>Image (Optional)</FormLabel>
                                              {value && (
                                                  <div className="relative w-20 h-20 border rounded-md p-1">
                                                      <Image src={value} alt="Variant preview" layout="fill" className="object-contain" />
                                                      <Button type="button" variant="ghost" size="icon" className="absolute -top-3 -right-3 h-6 w-6 bg-background rounded-full" onClick={() => {
                                                          onChange("");
                                                          if (fileInputRef.current) fileInputRef.current.value = "";
                                                      }}>
                                                          <Trash2 className="h-4 w-4 text-destructive" />
                                                      </Button>
                                                  </div>
                                              )}
                                              <FormControl>
                                              <Input
                                                  {...rest}
                                                  ref={fileInputRef}
                                                  type="file"
                                                  accept="image/*"
                                                  onChange={(e) => {
                                                  const file = e.target.files?.[0];
                                                  if (file) {
                                                      const reader = new FileReader();
                                                      reader.onloadend = () => onChange(reader.result as string);
                                                      reader.readAsDataURL(file);
                                                  }
                                                  }}
                                              />
                                              </FormControl>
                                              <FormMessage />
                                          </FormItem>
                                      )
                                  }}/>
                              </div>
                          </Card>
                      ))}
                  </CardContent>
              </Card>
            )}
        </div>

        <div className="lg:col-span-1 space-y-8">
            <Card>
                <CardHeader><CardTitle>Organization</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <FormField control={form.control} name="vendorId" render={({ field }) => (
                        <FormItem><FormLabel>Vendor</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select a vendor" /></SelectTrigger></FormControl>
                            <SelectContent>{vendors.map((v) => (<SelectItem key={v.id} value={String(v.id)}>{v.fullName}</SelectItem>))}</SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )} />
                     <FormField control={form.control} name="categoryId" render={({ field }) => (
                        <FormItem><FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
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
                                <FormDescription>Display this product prominently.</FormDescription>
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
            <Button type="submit" disabled={isSubmitting || !variantsGenerated}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? "Save Changes" : "Create Product"}
            </Button>
            {!variantsGenerated && (
              <p className="text-sm text-destructive mt-2">Please generate variants before saving.</p>
            )}
        </div>
      </form>
    </Form>
  );
}

function OptionValuesArray({ groupIndex, isReadOnly }: { groupIndex: number, isReadOnly: boolean }) {
  const { control } = useFormContext<ProductFormValues>();
  const { fields, append, remove } = useFieldArray({
    control: control,
    name: `optionGroups.${groupIndex}.options`,
  });

  return (
    <div className="space-y-4">
        <FormLabel>Options</FormLabel>
        {fields.map((field, optionIndex) => (
            <div key={field.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-md relative">
            <FormField
                control={control}
                name={`optionGroups.${groupIndex}.options.${optionIndex}.value`}
                render={({ field }) => (
                <FormItem>
                    <FormLabel className="text-xs">Option Value</FormLabel>
                    <FormControl>
                    <Input placeholder="e.g., Red" {...field} disabled={isReadOnly} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={control}
                name={`optionGroups.${groupIndex}.options.${optionIndex}.image`}
                render={({ field: { onChange, value, ...rest } }) => {
                    const fileInputRef = React.useRef<HTMLInputElement>(null);
                    return (
                        <FormItem>
                            <FormLabel className="text-xs">Image (Optional)</FormLabel>
                            {value && (
                                <div className="relative w-16 h-16 border rounded-md p-1">
                                    <Image src={value} alt="Option preview" layout="fill" className="object-contain" />
                                    <Button type="button" variant="ghost" size="icon" className="absolute -top-2 -right-2 h-5 w-5 bg-background rounded-full" onClick={() => {
                                        onChange("");
                                        if (fileInputRef.current) fileInputRef.current.value = "";
                                    }} disabled={isReadOnly}>
                                        <Trash className="h-3 w-3 text-destructive" />
                                    </Button>
                                </div>
                            )}
                            <FormControl>
                            <Input
                                {...rest}
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                disabled={isReadOnly}
                                onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => onChange(reader.result as string);
                                    reader.readAsDataURL(file);
                                }
                                }}
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    );
                }}
            />

            {!isReadOnly && (
                <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => remove(optionIndex)}>
                <Trash className="h-4 w-4 text-destructive" />
                </Button>
            )}
            </div>
        ))}
       {!isReadOnly && (
        <Button type="button" variant="outline" size="sm" onClick={() => append({ value: '', image: '', color_hex: '' })}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Option
        </Button>
       )}
    </div>
  );
}


    