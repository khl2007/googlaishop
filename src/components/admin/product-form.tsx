
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { getCrossProduct } from "@/lib/utils";


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

const generatedVariantSchema = z.object({
  options: z.record(z.string()),
  price: z.preprocess((a) => parseInt(z.string().parse(a), 10), z.number().positive("Price must be positive.")),
  stock: z.preprocess((a) => parseInt(z.string().parse(a), 10), z.number().int().min(0, "Stock can't be negative.")),
  image: z.string().url("Image URL is required.").optional(),
});


const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  slug: z.string().min(2, "Slug must be at least 2 characters.").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase and contain only letters, numbers, and hyphens."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  categoryId: z.string().min(1, "Please select a category."),
  optionGroups: z.array(optionGroupSchema).optional(),
  variants: z.array(generatedVariantSchema).min(1, "At least one product variant is required."),
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
      })) || [],
    },
  });

  const { fields: groupFields, append: appendGroup, remove: removeGroup } = useFieldArray({
    control: form.control,
    name: "optionGroups",
  });
  
  const watchedGroups = form.watch('optionGroups');

  React.useEffect(() => {
    if (isEditMode) return;

    const groupArrays = watchedGroups?.map(g => 
        g.options.map(o => ({ [g.name]: o.value }))
    ) || [];

    if (groupArrays.length === 0) {
        if(form.getValues('variants').length === 0) {
            form.setValue('variants', [{ options: { default: 'Standard' }, price: 0, stock: 0 }]);
        }
        return;
    }
    
    const combinations = getCrossProduct(...groupArrays);
    const newVariants = combinations.map(combo => {
        const options = combo.reduce((acc, item) => ({ ...acc, ...item }), {});
        // Try to find an existing variant to preserve price/stock
        const existingVariant = form.getValues('variants').find(v => 
            JSON.stringify(v.options) === JSON.stringify(options)
        );
        return {
            options,
            price: existingVariant?.price || 0,
            stock: existingVariant?.stock || 0,
            image: existingVariant?.image || ''
        };
    });

    form.setValue('variants', newVariants);

  }, [watchedGroups, form, isEditMode]);


  const isSubmitting = form.formState.isSubmitting;

  const onSubmit: SubmitHandler<ProductFormValues> = async (data) => {
    const transformedData = {
        ...data,
        optionGroups: data.optionGroups ? JSON.stringify(data.optionGroups) : "[]",
        variants: data.variants.map(v => ({
            ...v,
            name: Object.values(v.options).join(', '),
            options: JSON.stringify(v.options)
        }))
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
            <CardTitle>Product Options</CardTitle>
            <FormDescription>
              Define option groups for your variants, like 'Color' or 'Size'. This will generate all possible product combinations.
            </FormDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {groupFields.map((groupField, groupIndex) => (
              <Card key={groupField.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <FormField
                    control={form.control}
                    name={`optionGroups.${groupIndex}.name`}
                    render={({ field }) => (
                      <FormItem className="flex-1 mr-4">
                        <FormLabel>Option Group Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Color" {...field} disabled={isEditMode} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   {!isEditMode && (
                      <Button type="button" variant="destructive" onClick={() => removeGroup(groupIndex)}>
                        <Trash className="mr-2 h-4 w-4" /> Remove Group
                      </Button>
                   )}
                </CardHeader>
                <CardContent>
                  <OptionValuesArray groupIndex={groupIndex} isEditMode={isEditMode} />
                </CardContent>
              </Card>
            ))}
             {!isEditMode && (
                <Button type="button" variant="outline" onClick={() => appendGroup({ name: '', options: [{ value: '' }] })}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Option Group
                </Button>
             )}
             {isEditMode && <p className="text-sm text-muted-foreground">Option groups cannot be changed after creation.</p>}
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader><CardTitle>Generated Variants</CardTitle></CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                           {groupNames.map(name => <TableHead key={name}>{name}</TableHead>)}
                            <TableHead>Price</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead>Image URL</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {form.watch('variants').map((variant, index) => (
                            <TableRow key={index}>
                               {groupNames.map(name => <TableCell key={name}>{variant.options[name]}</TableCell>)}
                                <TableCell>
                                    <FormField control={form.control} name={`variants.${index}.price`} render={({ field }) => (
                                        <Input type="number" {...field} disabled={isEditMode} />
                                    )} />
                                </TableCell>
                                <TableCell>
                                    <FormField control={form.control} name={`variants.${index}.stock`} render={({ field }) => (
                                        <Input type="number" {...field} disabled={isEditMode} />
                                    )} />
                                </TableCell>
                                <TableCell>
                                    <FormField control={form.control} name={`variants.${index}.image`} render={({ field }) => (
                                        <Input placeholder="https://..." {...field} disabled={isEditMode} />
                                    )} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                 {isEditMode && <p className="text-sm text-muted-foreground mt-4">Variant editing is not supported. To change variants, please delete and recreate the product.</p>}
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
  const { control } = useForm<ProductFormValues>();
  const { fields, append, remove } = useFieldArray({
    control: control,
    name: `optionGroups.${groupIndex}.options`,
  });

  return (
    <div className="space-y-4">
      {fields.map((field, optionIndex) => (
        <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 border p-4 rounded-md relative">
          <FormField
            control={control}
            name={`optionGroups.${groupIndex}.options.${optionIndex}.value`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Option Value</FormLabel>
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
                <FormLabel>Image URL (Optional)</FormLabel>
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
                <FormLabel>Color (Optional)</FormLabel>
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
