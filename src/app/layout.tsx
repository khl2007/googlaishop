import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { headers } from 'next/headers';
import './globals.css';
import { cn } from '@/lib/utils';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Toaster } from '@/components/ui/toaster';
import { Providers } from '@/components/providers';
import { getUser } from '@/lib/session';
import { BottomToolbar } from '@/components/bottom-toolbar';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Zain Inspired E-Shop',
  description: 'A modern e-commerce platform inspired by Zain.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUser();
  const headersList = headers();
  const pathname = headersList.get('x-next-pathname') || '';

  const isAdminRoute = pathname.startsWith('/admin');
  const isVendorRoute = pathname.startsWith('/vendor');
  const isDeliveryRoute = pathname.startsWith('/delivery');
  
  const showHeaderAndFooter = !isAdminRoute && !isVendorRoute && !isDeliveryRoute;

  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={cn('min-h-screen font-body antialiased', inter.variable)}>
        <Providers>
          {showHeaderAndFooter ? (
            <div className="relative flex min-h-dvh flex-col">
              <Header user={user} />
              <main className="flex-1 pb-16 md:pb-0">{children}</main>
              <Footer />
              <BottomToolbar user={user} />
            </div>
          ) : (
            <>{children}</>
          )}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
