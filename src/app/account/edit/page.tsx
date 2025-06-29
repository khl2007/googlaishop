
import { getUser } from '@/lib/session';
import { notFound } from 'next/navigation';
import { getUserProfileById } from '@/lib/data';
import { ProfileForm } from '@/components/profile-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function EditProfilePage() {
  const sessionUser = await getUser();
  if (!sessionUser) {
    notFound(); // Protected by middleware
  }

  const userProfile = await getUserProfileById(sessionUser.id);
  if (!userProfile) {
    notFound();
  }

  return (
    <div className="container mx-auto my-12 px-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
          <CardDescription>Update your account information.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm user={userProfile} />
        </CardContent>
      </Card>
    </div>
  );
}
