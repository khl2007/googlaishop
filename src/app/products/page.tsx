import { ProductCard } from "@/components/product-card";
import { allProducts, allCategories } from "@/lib/mock-data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function ProductsPage() {
  return (
    <div className="container mx-auto my-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold font-headline tracking-tight lg:text-5xl">Our Collection</h1>
        <p className="mt-4 text-lg text-muted-foreground">Browse through our hand-picked selection of premium electronics.</p>
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
        <aside className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
              <CardDescription>Filter by category</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {allCategories.map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/products?category=${category.slug}`}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </aside>
        <main className="md:col-span-3">
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
            {allProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
