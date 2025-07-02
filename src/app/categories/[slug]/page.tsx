
import { notFound } from "next/navigation";
import { getCategoryBySlug, getProductsByCategoryId, getSubCategories, getCategoryById, getActiveSliderGroupForCategory } from "@/lib/data";
import { ProductCard } from "@/components/product-card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { CategoryCard } from "@/components/category-card";
import { CategorySlider } from "@/components/category-slider";

export default async function CategoryProductsPage({ params: { slug } }: { params: { slug: string } }) {
  const category = await getCategoryBySlug(slug);
  if (!category) {
    notFound();
  }

  const [subCategories, sliderGroup] = await Promise.all([
    getSubCategories(category.id),
    getActiveSliderGroupForCategory(category.id),
  ]);

  const products = subCategories.length === 0
    ? await getProductsByCategoryId(category.id)
    : [];
  
  const parentCategory = category.parentId ? await getCategoryById(category.parentId) : null;

  return (
    <div className="container mx-auto my-12 px-4">
      
      {sliderGroup && <CategorySlider sliderGroup={sliderGroup} />}
      
      <Breadcrumb className="mb-8">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/categories">Categories</BreadcrumbLink>
          </BreadcrumbItem>
          {parentCategory && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/categories/${parentCategory.slug}`}>{parentCategory.name}</BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{category.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      

      {subCategories.length > 0 && (
        <section className="mb-16">
         
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-8">
            {subCategories.map((subCat) => (
              <CategoryCard key={subCat.id} category={subCat} />
            ))}
          </div>
        </section>
      )}

      {subCategories.length === 0 && (
        <section>
          {products.length > 0 ? (
            <>
              <h2 className="text-3xl font-bold tracking-tight mb-8">Products in {category.name}</h2>
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          ) : (
            <p className="text-center text-muted-foreground py-16">
              There are no products in this category yet. Check back soon!
            </p>
          )}
        </section>
      )}
    </div>
  );
}
