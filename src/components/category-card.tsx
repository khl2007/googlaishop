import Link from 'next/link';
import Image from 'next/image';
import type { Category } from '@/lib/types';
import { Card, CardContent, CardTitle } from '@/components/ui/card';

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link href={`/categories/${category.slug}`}>
      <Card className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <div className="aspect-video overflow-hidden">
          <Image
            src={category.image || 'https://placehold.co/400x300.png'}
            alt={category.name}
            width={400}
            height={300}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={`${category.slug} abstract`}
          />
        </div>
        <CardContent className="p-4">
          <CardTitle className="text-lg font-semibold group-hover:text-primary">{category.name}</CardTitle>
        </CardContent>
      </Card>
    </Link>
  );
}
