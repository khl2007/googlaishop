
import { getUser } from '@/lib/session';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Edit } from 'lucide-react';

export default async function AccountPage() {
  const user = await getUser();

  if (!user) {
    // This should be handled by middleware, but as a fallback
    notFound();
  }

  return (
    <div className="container mx-auto my-12 px-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>My Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-3xl">
                {user.fullName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{user.fullName}</h2>
              <p className="text-muted-foreground">{user.username}</p>
            </div>
            <Button asChild variant="outline">
              <Link href="/account/edit">
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Link>
            </Button>
          </div>
          {/* Future sections like Order History can go here */}
        </CardContent>
      </Card>
    </div>
  );
}
