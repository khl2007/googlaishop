
import { getUser } from '@/lib/session';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Edit } from 'lucide-react';
import { AccountActions } from '@/components/account-actions';

export default async function AccountPage() {
  const user = await getUser();

  if (!user) {
    // This should be handled by middleware, but as a fallback
    notFound();
  }

  return (
    <div className="container mx-auto my-6 max-w-2xl px-4 md:my-12">
      <div className="space-y-8">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-6">
              <Avatar className="h-16 w-16 md:h-20 md:w-20">
                <AvatarFallback className="text-3xl">
                  {user.fullName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-2xl font-bold md:text-3xl">{user.fullName}</h1>
                <p className="text-sm text-muted-foreground">{user.username}</p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/account/edit">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </Button>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6">
            <AccountActions />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
