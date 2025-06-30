import { CustomerForm } from "@/components/admin/customer-form";
import { getRoles } from "@/lib/data";

export default async function NewCustomerPage() {
  const roles = await getRoles();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Create New Customer</h1>
      <CustomerForm roles={roles} />
    </div>
  );
}
