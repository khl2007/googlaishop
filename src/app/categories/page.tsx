"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
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
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/categories');
        const data = await res.json();
        // Only show top-level categories on this page
        const topLevelCategories = data.filter((c: Category) => !c.parentId);
        setAllCategories(topLevelCategories);
        setFilteredCategories(topLevelCategories);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const results = allCategories.filter(category =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCategories(results);
  }, [searchTerm, allCategories]);

  return (
    <div className="container mx-auto my-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold font-headline tracking-tight lg:text-5xl">Explore Our Categories</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Find the products you love by browsing through our curated collections.
        </p>
      </div>

      <div className="mb-12 max-w-lg mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <CategorySkeleton key={i} />)}
        </div>
      ) : filteredCategories.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 xl:grid-cols-4">
          {filteredCategories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground">No categories found matching your search.</p>
      )}
    </div>
  );
}
