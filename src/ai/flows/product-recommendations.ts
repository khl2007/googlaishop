// src/ai/flows/product-recommendations.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing product recommendations based on viewed or carted products.
 *
 * - `getProductRecommendations` - A function that takes a product description or a list of product IDs and returns a list of recommended product IDs.
 * - `ProductRecommendationsInput` - The input type for the `getProductRecommendations` function.
 * - `ProductRecommendationsOutput` - The return type for the `getProductRecommendations` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getAllProducts } from '@/lib/data';

const ProductListSchema = z.array(z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  tags: z.string().optional(),
}));

const ProductRecommendationsInputSchema = z.object({
  productDescription: z.string().optional().describe('A description of the product the user is viewing or has in their cart.'),
  productIds: z.array(z.string()).optional().describe('A list of product IDs of products the user has viewed or has in their cart.'),
  productList: ProductListSchema.optional().describe('The list of all available products to recommend from.'),
});

// The wrapper function will not expose productList
const PublicInputSchema = ProductRecommendationsInputSchema.omit({ productList: true });
export type ProductRecommendationsInput = z.infer<typeof PublicInputSchema>;

const ProductRecommendationsOutputSchema = z.object({
  recommendedProductIds: z.array(z.string()).describe('A list of recommended product IDs.'),
});
export type ProductRecommendationsOutput = z.infer<typeof ProductRecommendationsOutputSchema>;

export async function getProductRecommendations(input: ProductRecommendationsInput): Promise<ProductRecommendationsOutput> {
  return productRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'productRecommendationsPrompt',
  input: {schema: ProductRecommendationsInputSchema},
  output: {schema: ProductRecommendationsOutputSchema},
  prompt: `You are a product recommendation expert for an online shop.

  Based on the product description or the list of product IDs provided, you will recommend other product IDs from the available products list that the user might be interested in.

  Return an array of product IDs. Only return IDs from the provided product list. Do not recommend more than 4 products.

  Description: {{{productDescription}}}
  Product IDs: {{#each productIds}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

  Available Products (return IDs from this list):
  {{#each productList}}
  - ID: {{{this.id}}}, Name: {{{this.name}}}, Description: {{{this.description}}}, Tags: {{{this.tags}}}
  {{/each}}
  `,
});

const productRecommendationsFlow = ai.defineFlow(
  {
    name: 'productRecommendationsFlow',
    inputSchema: PublicInputSchema,
    outputSchema: ProductRecommendationsOutputSchema,
  },
  async input => {
    if (!input.productDescription && (!input.productIds || input.productIds.length === 0)) {
      return { recommendedProductIds: [] };
    }

    const allProducts = await getAllProducts();
    const productListForPrompt = allProducts.map(p => ({
        id: p.id,
        name: p.name,
        description: p.shortDescription || p.description, // use short description if available
        tags: p.tags
    }));

    const {output} = await prompt({
        ...input,
        productList: productListForPrompt,
    });

    return output!;
  }
);
