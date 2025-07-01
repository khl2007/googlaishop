
import { getShippingMethodById, getAllCitiesWithCountry, getAllAreasWithCity } from "@/lib/data";
import { ShippingForm } from "@/components/admin/shipping-form";
import { notFound } from "next/navigation";

export default async function EditShippingPage({ params: { id } }: { params: { id: string } }) {
  const [method, cities, areas] = await Promise.all([
    getShippingMethodById(id),
    getAllCitiesWithCountry(),
    getAllAreasWithCity()
  ]);

  if (!method) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Edit Shipping Method</h1>
      <ShippingForm method={method} cities={cities} areas={areas} />
    </div>
  );
}
