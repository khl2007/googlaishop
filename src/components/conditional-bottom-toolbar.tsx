'use client';

import { usePathname } from 'next/navigation';
import { BottomToolbar } from '@/components/bottom-toolbar';
import type { User } from '@/lib/types';

interface ConditionalBottomToolbarProps {
  user: User | null;
}

export function ConditionalBottomToolbar({ user }: ConditionalBottomToolbarProps) {
  const pathname = usePathname();
  const isProductPage = /^\/products\/.+/.test(pathname);

  if (isProductPage) {
    return null;
  }

  return <BottomToolbar user={user} />;
}
