
"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductCard } from '@/components/product-card';
import type { Product } from '@/lib/types';
import { Frown, Loader2, Wand2 } from 'lucide-react';
import { ProductCardSkeleton } from '@/components/product-card-skeleton';
import { getProductRecommendations } from '@/ai/flows/product-recommendations';


function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [aiRecommendedProducts, setAiRecommendedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAiSearching, setIsAiSearching] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setFilteredProducts([]);
      setAiRecommendedProducts([]);
      try {
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        setAllProducts(data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      }
      setLoading(false);
    };
    fetchProducts();
  }, [query]); // Refetch all products when query changes to reset state

  useEffect(() => {
    if (!loading && query) {
      const lowercasedQuery = query.toLowerCase();
      const results = allProducts.filter(product =>
        product.name.toLowerCase().includes(lowercasedQuery) ||
        product.description.toLowerCase().includes(lowercasedQuery) ||
        product.tags?.toLowerCase().includes(lowercasedQuery)
      );
      setFilteredProducts(results);

      if (results.length === 0) {
        const runAiSearch = async () => {
          setIsAiSearching(true);
          try {
            const recommendations = await getProductRecommendations({ productDescription: query });
            if (recommendations.recommendedProductIds.length > 0) {
              const recommended = allProducts.filter(p => recommendations.recommendedProductIds.includes(p.id));
              setAiRecommendedProducts(recommended);
            }
          } catch (error) {
            console.error("AI recommendation search failed:", error);
          } finally {
            setIsAiSearching(false);
          }
        };
        runAiSearch();
      }
    } else if (!query) {
      setFilteredProducts([]);
      setAiRecommendedProducts([]);
    }
  }, [query, allProducts, loading]);

  if (loading) {
     return (
        <div className="container mx-auto my-12 px-4">
            <h1 className="text-3xl font-bold mb-8">Searching...</h1>
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
                {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
        </div>
     )
  }
  
  const noResultsFound = filteredProducts.length === 0 && aiRecommendedProducts.length === 0 && !isAiSearching;

  return (
    <div className="container mx-auto my-12 px-4">
      <h1 className="text-3xl font-bold mb-8">
        {query ? `Search Results for "${query}"` : 'Search'}
      </h1>

      {filteredProducts.length > 0 && (
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {isAiSearching && (
        <div className="text-center py-16">
           <Loader2 className="mx-auto h-16 w-16 animate-spin text-muted-foreground/30" />
           <h2 className="mt-6 text-2xl font-semibold flex items-center justify-center gap-2">
             <Wand2 /> Finding similar items for you...
           </h2>
        </div>
      )}

      {!isAiSearching && aiRecommendedProducts.length > 0 && filteredProducts.length === 0 && (
        <>
            <h2 className="text-2xl font-bold mb-8 border-t pt-8 mt-12 flex items-center gap-2">
                <Wand2 className="text-primary"/> No exact matches found. Here are some AI recommendations:
            </h2>
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
              {aiRecommendedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
        </>
      )}

      {noResultsFound && (
        <div className="text-center py-16 border-dashed border-2 rounded-lg">
           <Frown className="mx-auto h-24 w-24 text-muted-foreground/30" />
           <h2 className="mt-6 text-2xl font-semibold">No products found</h2>
           <p className="mt-2 text-muted-foreground">We couldn&apos;t find anything matching your search. Please try a different term.</p>
        </div>
      )}
    </div>
  );
}

function SearchPageSkeleton() {
    return (
        <div className="container mx-auto my-12 px-4">
            <div className="flex items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-muted-foreground">Loading search...</p>
            </div>
        </div>
    )
}

export default function SearchPage() {
    return (
        <Suspense fallback={<SearchPageSkeleton />}>
            <SearchResults />
        </Suspense>
    )
}
