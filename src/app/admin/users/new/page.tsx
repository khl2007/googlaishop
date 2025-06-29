import { UserForm } from "@/components/admin/user-form";
import { getRoles } from "@/lib/data";

export default async function NewUserPage() {
  const roles = await getRoles();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Create New User</h1>
      <UserForm roles={roles} />
    </div>
  );
}
