
import { notFound } from "next/navigation";
import { getAdminUserById, getPrimaryAddressByUserId } from "@/lib/data";
import { AddressForm } from "@/components/admin/address-form";

export default async function VendorAddressPage({ params }: { params: { id: string } }) {
  const [vendor, address] = await Promise.all([
    getAdminUserById(params.id),
    getPrimaryAddressByUserId(params.id)
  ]);
  
  if (!vendor) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Manage Store Address</h1>
      <p className="text-muted-foreground mb-4">For vendor: {vendor.fullName}</p>
      <AddressForm address={address} userId={params.id} returnPath={`/admin/vendors/${params.id}/edit`} />
    </div>
  );
}
