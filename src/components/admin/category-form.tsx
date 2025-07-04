
"use client";

import React from "react";
import Image from "next/image";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { Category } from "@/lib/types";
import { Loader2, Trash2 } from "lucide-react";
import { getCsrfToken } from "@/lib/csrf";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  slug: z.string().min(2, "Slug must be at least 2 characters.").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase and contain only letters, numbers, and hyphens."),
  image: z.string().optional().or(z.literal('')),
  isMainCategory: z.boolean().default(true),
  parentId: z.string().optional(),
}).refine(data => {
    // If it's a subcategory, a parent must be selected.
    if (!data.isMainCategory && !data.parentId) {
        return false;
    }
    return true;
}, {
    message: "A parent category must be selected for sub-categories.",
    path: ["parentId"],
});


type CategoryFormValues = z.infer<typeof formSchema>;

interface CategoryFormProps {
  category?: Category;
  categories: Category[];
}

export function CategoryForm({ category, categories }: CategoryFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: category?.name || "",
      slug: category?.slug || "",
      image: category?.image || "",
      isMainCategory: !category?.parentId,
      parentId: category?.parentId || undefined,
    },
  });
  
  const [imagePreview, setImagePreview] = React.useState<string | null>(category?.image || null);
  const isMainCategory = form.watch("isMainCategory");
  const isSubmitting = form.formState.isSubmitting;
  const isEditMode = !!category;

  const onSubmit: SubmitHandler<CategoryFormValues> = async (data) => {
    const payload = {
      ...data,
      parentId: data.isMainCategory ? null : data.parentId,
    };

    try {
      const response = await fetch(
        isEditMode ? `/api/admin/categories/${category.id}` : "/api/admin/categories",
        {
          method: isEditMode ? "PUT" : "POST",
          headers: { 
            "Content-Type": "application/json",
            "x-csrf-token": getCsrfToken(),
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Something went wrong");
      }
      
      toast({
        title: "Success",
        description: `Category ${isEditMode ? 'updated' : 'created'} successfully.`,
      });
      router.push("/admin/categories");
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Smartphones" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input placeholder="e.g., smartphones" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="image"
          render={({ field: { onChange, value, ...rest } }) => (
            <FormItem>
              <FormLabel>Image</FormLabel>
              {imagePreview && (
                <div className="relative w-40 h-40 border rounded-md p-2">
                  <Image src={imagePreview} alt="Category preview" layout="fill" className="object-contain" />
                  <Button type="button" variant="ghost" size="icon" className="absolute -top-3 -right-3 h-6 w-6 bg-background rounded-full" onClick={() => {
                      onChange("");
                      setImagePreview(null);
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
                      reader.onloadend = () => {
                        const dataUrl = reader.result as string;
                        onChange(dataUrl);
                        setImagePreview(dataUrl);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </FormControl>
              <FormDescription>
                Upload an image for the category.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isMainCategory"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Set as a main category
                </FormLabel>
                <FormDescription>
                  Main categories appear at the top level. Uncheck this to make it a sub-category.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        {!isMainCategory && (
          <FormField
            control={form.control}
            name="parentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parent Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a parent category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditMode ? "Save Changes" : "Create Category"}
        </Button>
      </form>
    </Form>
  );
}
