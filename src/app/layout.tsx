
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
import { BottomToolbar } from '@/components/bottom-toolbar';
import { PageTransitionWrapper } from '@/components/page-transition-wrapper';

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
  const headersList = headers();
  const pathname = headersList.get('x-next-pathname') || '';

  const isAdminRoute = pathname.startsWith('/admin');
  const isVendorRoute = pathname.startsWith('/vendor');
  const isDeliveryRoute = pathname.startsWith('/delivery');
  
  const showHeaderAndFooter = !isAdminRoute && !isVendorRoute && !isDeliveryRoute;

  // This regex matches /products/ followed by one or more characters, i.e., a product page
  const isProductPage = /^\/products\/.+/.test(pathname);

  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={cn('min-h-screen font-body antialiased overflow-x-hidden', inter.variable)}>
        <Providers>
          <div className="relative flex min-h-dvh flex-col">
            {showHeaderAndFooter && <Header user={user} />}
            <main className="flex flex-1 pb-16 md:pb-0">
              <PageTransitionWrapper>
                {children}
              </PageTransitionWrapper>
            </main>
            {showHeaderAndFooter && <Footer />}
            {/* The BottomToolbar will now be hidden on product detail pages */}
            {showHeaderAndFooter && !isProductPage && <BottomToolbar user={user} />}
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
