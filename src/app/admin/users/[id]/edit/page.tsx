import { getAdminUserById, getRoles } from "@/lib/data";
import { UserForm } from "@/components/admin/user-form";
import { notFound } from "next/navigation";

export default async function EditUserPage({ params }: { params: { id: string } }) {
  const [user, roles] = await Promise.all([
    getAdminUserById(params.id),
    getRoles()
  ]);

  if (!user) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Edit User</h1>
      <UserForm user={user} roles={roles} />
    </div>
  );
}
