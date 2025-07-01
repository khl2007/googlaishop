
import { getAdminUserById, getRoles } from "@/lib/data";
import { VendorForm } from "@/components/admin/vendor-form";
import { notFound } from "next/navigation";
import type { Role } from "@/lib/types";

export default async function EditVendorPage({ params: { id } }: { params: { id: string } }) {
  const [vendor, roles] = await Promise.all([
    getAdminUserById(id),
    getRoles()
  ]);

  if (!vendor || !roles.find((r: Role) => r.id === vendor.role_id && r.name === 'vendor')) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Edit Vendor</h1>
      <VendorForm vendor={vendor} roles={roles} />
    </div>
  );
}
