"use client";

import React from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import type { Slide } from "@/lib/types";
import { Loader2, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Switch } from "../ui/switch";
import { getCsrfToken } from "@/lib/csrf";

const formSchema = z.object({
  title: z.string().min(2, "Title is required."),
  description: z.string().optional(),
  image: z.string().min(1, "Image is required."),
  link: z.string().optional(),
  buttonText: z.string().optional(),
  isActive: z.boolean().default(false),
  order: z.coerce.number().int().default(0),
});

type SlideFormValues = z.infer<typeof formSchema>;

interface SlideFormProps {
  slide?: Slide;
}

export function SlideForm({ slide }: SlideFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEditMode = !!slide;
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<SlideFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: slide?.title || "",
      description: slide?.description || "",
      image: slide?.image || "",
      link: slide?.link || "",
      buttonText: slide?.buttonText || "",
      isActive: slide?.isActive || false,
      order: slide?.order || 0,
    },
  });

  const [imagePreview, setImagePreview] = React.useState<string | null>(slide?.image || null);

  const onSubmit: SubmitHandler<SlideFormValues> = async (data) => {
    try {
      const response = await fetch(
        isEditMode ? `/api/admin/slides/${slide.id}` : "/api/admin/slides",
        {
          method: isEditMode ? "PUT" : "POST",
          headers: { 
            "Content-Type": "application/json",
            "x-csrf-token": getCsrfToken(),
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Something went wrong");
      }
      
      toast({
        title: "Success",
        description: `Slide ${isEditMode ? 'updated' : 'created'} successfully.`,
      });
      router.push("/admin/slides");
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
          <CardHeader><CardTitle>Slide Content</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl><Input placeholder="e.g., Summer Sale" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl><Textarea placeholder="Short text to display on the slide" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="image"
              render={({ field: { onChange, value, ...fieldProps }}) => (
                <FormItem>
                  <FormLabel>Slide Image</FormLabel>
                  {imagePreview && (
                    <div className="relative mt-2 aspect-video w-full max-w-lg overflow-hidden rounded-md border p-2">
                        <Image src={imagePreview} alt="Slide preview" layout="fill" className="object-contain" />
                        <Button type="button" variant="ghost" size="icon" className="absolute -top-3 -right-3 h-6 w-6" onClick={() => {
                            onChange("");
                            setImagePreview(null);
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
                            setImagePreview(dataUrl);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </FormControl>
                  <FormDescription>Recommended size: 1200x500 pixels.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Slide Action & Appearance</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <FormField
                control={form.control}
                name="link"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Link URL (Optional)</FormLabel>
                    <FormControl><Input placeholder="/products/some-product" {...field} /></FormControl>
                    <FormDescription>Where the user goes when they click the slide.</FormDescription>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="buttonText"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Button Text (Optional)</FormLabel>
                    <FormControl><Input placeholder="Shop Now" {...field} /></FormControl>
                    <FormDescription>Text for the call-to-action button.</FormDescription>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="order"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Display Order</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormDescription>A lower number will show up first.</FormDescription>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                    <FormLabel className="text-base">Activate Slide</FormLabel>
                    <FormDescription>If inactive, this slide will not be shown on the homepage.</FormDescription>
                    </div>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
                )}
            />
          </CardContent>
        </Card>

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditMode ? "Save Changes" : "Create Slide"}
        </Button>
      </form>
    </Form>
  );
}
