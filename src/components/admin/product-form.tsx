
"use client";

import React from "react";
import Image from "next/image";
import { useForm, useFieldArray, type SubmitHandler, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import type { Product, Category } from "@/lib/types";
import { Loader2, PlusCircle, Trash, Trash2, Wand2, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription as CardDescriptionPrimitive } from "@/components/ui/card";
import { Switch } from "../ui/switch";
import { getCsrfToken } from "@/lib/csrf";
import { getCrossProduct, cn } from "@/lib/utils";
import { WysiwygEditor } from "../wysiwyg-editor";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const optionSchema = z.object({
  value: z.string().min(1, "Option value cannot be empty."),
  image: z.string().optional().or(z.literal('')),
  color_hex: z.string().optional(),
});

const optionGroupSchema = z.object({
  type: z.enum(['default', 'color', 'gender']),
  name: z.string().min(1, "Group name cannot be empty."),
  options: z.array(optionSchema).min(1, "At least one option value is required."),
});

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  slug: z.string().min(2, "Slug must be at least 2 characters.").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase and contain only letters, numbers, and hyphens."),
  shortDescription: z.string().max(200, "Short description cannot exceed 200 characters.").optional(),
  description: z.string().min(10, "Description must be at least 10 characters."),
  categoryId: z.string().min(1, "Please select a category."),
  vendorId: z.string().min(1, "Please select a vendor."),
  optionGroups: z.array(optionGroupSchema).optional(),
  variants: z.array(variantSchema).min(1, "At least one product variant is required."),
  tags: z.string().optional(),
  isFeatured: z.boolean().default(false),
  isOnOffer: z.boolean().default(false),
  weight: z.preprocess(
      (val) => (val === "" || val == null ? undefined : val),
      z.coerce.number({ invalid_type_error: "Weight must be a number." }).min(0, "Weight must be non-negative.").optional()
  ),
  dimensions: z.string().optional(),
  images: z.array(z.string()).optional(),
  mainImage: z.string().optional(),
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
      shortDescription: product?.shortDescription || "",
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
      images: product?.images ? JSON.parse(product.images) : [],
      mainImage: product?.mainImage || "",
    },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });
  
  const optionGroups = form.watch("optionGroups");
  
  const { fields: groupFields, append: appendGroup, remove: removeGroup } = useFieldArray({
    control: form.control,
    name: "optionGroups",
  });
  
  const { fields: variantFields, remove: removeVariant } = useFieldArray({
    control: form.control,
    name: "variants",
  });
  
  const [variantsGenerated, setVariantsGenerated] = React.useState(isEditMode || (product?.optionGroups && JSON.parse(product.optionGroups).length === 0));
  const isSubmitting = form.formState.isSubmitting;
  
  const handleGenerateVariants = () => {
    const optionGroups = form.getValues('optionGroups');
    if (!optionGroups || optionGroups.length === 0) {
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
        images: JSON.stringify(data.images || []),
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
                    <FormField control={form.control} name="shortDescription" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Short Description</FormLabel>
                            <FormControl><Input placeholder="A brief, catchy summary of the product..." {...field} /></FormControl>
                            <FormDescription>This will be shown on product listings. Keep it concise (max 200 characters).</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Full Description</FormLabel>
                            <FormControl>
                                <WysiwygEditor
                                    value={field.value || ''}
                                    onChange={field.onChange}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </CardContent>
            </Card>

            <ProductImageForm />

            <Card>
              <CardHeader>
                  <CardTitle>Product Options</CardTitle>
                  <CardDescriptionPrimitive>
                    Define groups of options for your product, like 'Color' or 'Size'. If your product has no options, you can skip this section.
                  </CardDescriptionPrimitive>
              </CardHeader>
              <CardContent className="space-y-6">
                  {groupFields.map((groupField, groupIndex) => (
                    <Card key={groupField.id}>
                        <CardHeader className="flex flex-row items-center justify-between py-4">
                            <FormField control={form.control} name={`optionGroups.${groupIndex}.name`} render={({ field }) => (
                                <FormItem className="flex-1"><FormLabel className="sr-only">Group Name</FormLabel><FormControl><Input placeholder="e.g., Color" {...field} disabled={variantsGenerated} className="text-base font-semibold" /></FormControl><FormMessage /></FormItem>
                            )} />
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeGroup(groupIndex)} disabled={variantsGenerated}>
                              <Trash className="h-4 w-4 text-destructive" />
                          </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <OptionValuesArray groupIndex={groupIndex} isReadOnly={variantsGenerated} />
                        </CardContent>
                    </Card>
                  ))}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button type="button" variant="outline" disabled={variantsGenerated}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Option Group
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onSelect={() => appendGroup({ type: 'default', name: 'Size', options: [{ value: 'Small', image: '', color_hex: '' }] })}>
                            Standard
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => appendGroup({ type: 'color', name: 'Color', options: [{ value: 'White', image: '', color_hex: '#ffffff' }] })}>
                            Color
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => appendGroup({ type: 'gender', name: 'Gender', options: [{ value: 'Unisex', image: '', color_hex: '' }] })}>
                            Gender
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

              </CardContent>
              {optionGroups && optionGroups.length > 0 && (
                <CardFooter className="justify-end">
                    <Button type="button" onClick={handleGenerateVariants} disabled={variantsGenerated}>
                        <Wand2 className="mr-2 h-4 w-4" />
                        Generate Variants
                    </Button>
                </CardFooter>
              )}
            </Card>
            
            {(variantsGenerated || (optionGroups && optionGroups.length === 0)) && (
              <Card>
                  <CardHeader><CardTitle>Manage Variants</CardTitle>
                  <CardDescriptionPrimitive>
                    Configure the price, stock, and image for each product variant.
                  </CardDescriptionPrimitive>
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
            <Button type="submit" disabled={isSubmitting || (!variantsGenerated && optionGroups && optionGroups.length > 0)}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? "Save Changes" : "Create Product"}
            </Button>
            {!variantsGenerated && optionGroups && optionGroups.length > 0 && (
              <p className="text-sm text-destructive mt-2">Please generate variants before saving.</p>
            )}
        </div>
      </form>
    </Form>
  );
}

function OptionValuesArray({ groupIndex, isReadOnly }: { groupIndex: number, isReadOnly: boolean }) {
  const { control, watch } = useFormContext<ProductFormValues>();
  const { fields, append, remove } = useFieldArray({
    control: control,
    name: `optionGroups.${groupIndex}.options`,
  });

  const groupType = watch(`optionGroups.${groupIndex}.type`);

  const renderInputs = (optionIndex: number) => {
    switch (groupType) {
        case 'color':
            return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <FormField control={control} name={`optionGroups.${groupIndex}.options.${optionIndex}.value`} render={({ field }) => (
                        <FormItem><FormLabel className="text-xs">Option Value</FormLabel><FormControl><Input placeholder="e.g., Red" {...field} disabled={isReadOnly} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={control} name={`optionGroups.${groupIndex}.options.${optionIndex}.color_hex`} render={({ field }) => (
                        <FormItem><FormLabel className="text-xs">Hex</FormLabel><FormControl><Input type="color" {...field} disabled={isReadOnly} className="h-10 w-full" /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <OptionImageUpload groupIndex={groupIndex} optionIndex={optionIndex} isReadOnly={isReadOnly} />
                </div>
            );
        case 'gender':
             return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                     <FormField control={control} name={`optionGroups.${groupIndex}.options.${optionIndex}.value`} render={({ field }) => (
                        <FormItem className="w-full">
                            <FormLabel className="text-xs">Gender</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isReadOnly}>
                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="Unisex">Unisex</SelectItem>
                                    <SelectItem value="Men">Men</SelectItem>
                                    <SelectItem value="Women">Women</SelectItem>
                                    <SelectItem value="Kids">Kids</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}/>
                    <OptionImageUpload groupIndex={groupIndex} optionIndex={optionIndex} isReadOnly={isReadOnly} />
                </div>
             );
        default: // 'default' type
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    <FormField control={control} name={`optionGroups.${groupIndex}.options.${optionIndex}.value`} render={({ field }) => (
                        <FormItem><FormLabel className="text-xs">Option Value</FormLabel><FormControl><Input placeholder="e.g., Small" {...field} disabled={isReadOnly} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <OptionImageUpload groupIndex={groupIndex} optionIndex={optionIndex} isReadOnly={isReadOnly} />
                </div>
            );
    }
  };

  return (
    <div className="space-y-4">
        <FormLabel>Options</FormLabel>
        {fields.map((field, optionIndex) => (
            <div key={field.id} className="border p-4 rounded-md relative">
                {renderInputs(optionIndex)}
                {!isReadOnly && fields.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-7 w-7" onClick={() => remove(optionIndex)}>
                        <Trash className="h-4 w-4 text-destructive" />
                    </Button>
                )}
            </div>
        ))}
       {!isReadOnly && (
        <Button type="button" variant="outline" size="sm" onClick={() => append({ value: '', image: '', color_hex: '#000000' })}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Option
        </Button>
       )}
    </div>
  );
}

function OptionImageUpload({ groupIndex, optionIndex, isReadOnly }: { groupIndex: number, optionIndex: number, isReadOnly: boolean }) {
    const { control } = useFormContext<ProductFormValues>();
    return (
        <FormField
            control={control}
            name={`optionGroups.${groupIndex}.options.${optionIndex}.image`}
            render={({ field: { onChange, value, ...rest } }) => {
                const fileInputRef = React.useRef<HTMLInputElement>(null);
                return (
                    <FormItem>
                        <FormLabel className="text-xs">Image (Optional)</FormLabel>
                        <div className="flex items-center gap-2">
                             {value && (
                                <div className="relative w-16 h-16 border rounded-md p-1 shrink-0">
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
                                    className="h-10 text-xs"
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
                        </div>
                        <FormMessage />
                    </FormItem>
                );
            }}
        />
    )
}

function ProductImageForm() {
  const { control, setValue, getValues, watch } = useFormContext<ProductFormValues>();
  const { toast } = useToast();
  
  const images = watch('images', []);
  const mainImage = watch('mainImage');
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const currentImages = getValues('images') || [];
      const newImagePromises = Array.from(files).map(file => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });
      
      try {
        const newImages = await Promise.all(newImagePromises);
        const allImages = [...currentImages, ...newImages];
        setValue('images', allImages, { shouldDirty: true });
        
        if (!getValues('mainImage') && allImages.length > 0) {
          setValue('mainImage', allImages[0], { shouldDirty: true });
        }
      } catch (error) {
        toast({ title: "Error reading file", variant: "destructive" });
      }
    }
  };

  const handleSetMain = (image: string) => {
    setValue('mainImage', image, { shouldDirty: true });
  };
  
  const handleDelete = (imageToDelete: string) => {
    const currentImages = getValues('images') || [];
    const newImages = currentImages.filter(img => img !== imageToDelete);
    setValue('images', newImages, { shouldDirty: true });
    
    if (getValues('mainImage') === imageToDelete) {
      setValue('mainImage', newImages[0] || '', { shouldDirty: true });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Images</CardTitle>
        <CardDescriptionPrimitive>Upload multiple images for the product gallery. Select one to be the main image.</CardDescriptionPrimitive>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={control}
          name="images"
          render={() => (
            <FormItem>
              <FormLabel>Upload Images</FormLabel>
              <FormControl>
                <Input type="file" multiple accept="image/*" onChange={handleImageUpload} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {images && images.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <div className={cn("aspect-square rounded-lg overflow-hidden border-2", mainImage === image ? 'border-primary' : 'border-transparent')}>
                  <Image src={image} alt={`Product image ${index + 1}`} fill className="object-cover" />
                </div>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => handleSetMain(image)}>
                    <Star className={cn("h-4 w-4", mainImage === image && "text-yellow-400 fill-yellow-400")} />
                  </Button>
                  <Button type="button" variant="destructive" size="icon" className="h-8 w-8" onClick={() => handleDelete(image)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
                {mainImage === image && (
                  <div className="absolute top-1 right-1 bg-primary text-primary-foreground text-xs font-bold px-1.5 py-0.5 rounded">MAIN</div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
