
"use client";

import { useEffect, useState } from 'react';
import type { Category } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { CategoryCard } from '@/components/category-card';

function CategorySkeleton() {
    return (
        <div className="space-y-2">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-6 w-3/4" />
        </div>
    )
}

export default function CategoriesPage() {
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/categories');
        const data = await res.json();
        // Only show top-level categories on this page
        const topLevelCategories = data.filter((c: Category) => !c.parentId);
        setAllCategories(topLevelCategories);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="container mx-auto my-12 px-4">
      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <CategorySkeleton key={i} />)}
        </div>
      ) : allCategories.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 xl:grid-cols-4">
          {allCategories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground">No categories found.</p>
      )}
    </div>
  );
}
