'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

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
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait" initial={false}>
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
    </AnimatePresence>
  );
}
