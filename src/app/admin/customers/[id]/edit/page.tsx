import { getAdminUserById, getRoles } from "@/lib/data";
import { CustomerForm } from "@/components/admin/customer-form";
import { notFound } from "next/navigation";
import type { Role } from "@/lib/types";

export default async function EditCustomerPage({ params }: { params: { id: string } }) {
  const [customer, roles] = await Promise.all([
    getAdminUserById(params.id),
    getRoles()
  ]);

  const customerRole = roles.find((r: Role) => r.name === 'customer');

  if (!customer || !customerRole || customer.role_id !== customerRole.id) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Edit Customer</h1>
      <CustomerForm customer={customer} roles={roles} />
    </div>
  );
}
