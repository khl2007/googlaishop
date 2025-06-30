import { ShippingForm } from "@/components/admin/shipping-form";
import { getAllCitiesWithCountry, getAllAreasWithCity } from "@/lib/data";

export default async function NewShippingPage() {
  const [cities, areas] = await Promise.all([
      getAllCitiesWithCountry(),
      getAllAreasWithCity()
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Create New Shipping Method</h1>
      <ShippingForm cities={cities} areas={areas} />
    </div>
  );
}
