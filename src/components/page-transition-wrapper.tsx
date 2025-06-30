'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { BottomToolbar } from '@/components/bottom-toolbar';
import type { User } from '@/lib/types';

interface PageTransitionWrapperProps {
  children: ReactNode;
  user: User | null;
  showHeaderAndFooter: boolean;
}

const variants = {
  initial: {
    x: '100vw',
    opacity: 0.8,
  },
  in: {
    x: 0,
    opacity: 1,
  },
  out: {
    x: '-100vw',
    opacity: 0.8,
  },
};

export function PageTransitionWrapper({
  children,
  user,
  showHeaderAndFooter,
}: PageTransitionWrapperProps) {
  const pathname = usePathname();

  const motionDiv = (
    <motion.div
      key={pathname}
      variants={variants}
      initial="initial"
      animate="in"
      exit="out"
      transition={{ type: 'tween', ease: 'anticipate', duration: 0.5 }}
      className="w-full"
    >
      {children}
    </motion.div>
  );

  if (showHeaderAndFooter) {
    return (
      <div className="relative flex min-h-dvh flex-col">
        <Header user={user} />
        <main className="flex flex-1 pb-16 md:pb-0">
          <AnimatePresence mode="wait" initial={false}>
            {motionDiv}
          </AnimatePresence>
        </main>
        <Footer />
        <BottomToolbar user={user} />
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {motionDiv}
    </AnimatePresence>
  );
}
