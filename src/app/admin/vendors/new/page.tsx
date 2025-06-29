
import { VendorForm } from "@/components/admin/vendor-form";
import { getRoles } from "@/lib/data";

export default async function NewVendorPage() {
  const roles = await getRoles();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Create New Vendor</h1>
      <VendorForm roles={roles} />
    </div>
  );
}
