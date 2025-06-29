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

const ProductRecommendationsInputSchema = z.object({
  productDescription: z.string().optional().describe('A description of the product the user is viewing or has in their cart.'),
  productIds: z.array(z.string()).optional().describe('A list of product IDs of products the user has viewed or has in their cart.'),
});
export type ProductRecommendationsInput = z.infer<typeof ProductRecommendationsInputSchema>;

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

  Based on the product description or the list of product IDs provided, you will recommend other product IDs that the user might be interested in.

  Return an array of product IDs.

  Description: {{{productDescription}}}
  Product IDs: {{#each productIds}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  `,
});

const productRecommendationsFlow = ai.defineFlow(
  {
    name: 'productRecommendationsFlow',
    inputSchema: ProductRecommendationsInputSchema,
    outputSchema: ProductRecommendationsOutputSchema,
  },
  async input => {
    if (!input.productDescription && (!input.productIds || input.productIds.length === 0)) {
      return { recommendedProductIds: [] };
    }
    const {output} = await prompt(input);
    return output!;
  }
);
