
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { headers } from 'next/headers';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { Providers } from '@/components/providers';
import { getUser } from '@/lib/session';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { PageTransitionWrapper } from '@/components/page-transition-wrapper';
import { ConditionalBottomToolbar } from '@/components/conditional-bottom-toolbar';
import { DeliveryToolbar } from '@/components/delivery-toolbar';
import { AddToCartDrawer } from '@/components/add-to-cart-drawer';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Zain Inspired E-Shop',
  description: 'A modern e-commerce platform inspired by Zain.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUser();
  const headersList = await headers();
  const pathname = headersList.get('x-next-pathname') || '';

  const isAdminRoute = pathname.startsWith('/admin');
  const isVendorRoute = pathname.startsWith('/vendor');
  const isDeliveryRoute = pathname.startsWith('/delivery');
  
  const showHeaderAndFooter = !isAdminRoute && !isVendorRoute && !isDeliveryRoute;

  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={cn('min-h-screen font-body antialiased overflow-x-hidden', inter.variable)}>
        <Providers>
          <div className="relative flex min-h-dvh flex-col">
            {showHeaderAndFooter && <Header user={user} />}
            {showHeaderAndFooter && <DeliveryToolbar user={user} />}
            <main className="flex flex-1 pb-16 md:pb-0">
              <PageTransitionWrapper>
                {children}
              </PageTransitionWrapper>
            </main>
            {showHeaderAndFooter && <Footer />}
            {showHeaderAndFooter && <ConditionalBottomToolbar user={user} />}
          </div>
          <Toaster />
          <AddToCartDrawer />
        </Providers>
      </body>
    </html>
  );
}
