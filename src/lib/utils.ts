import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function getCrossProduct<T>(...arrays: T[][]): T[][] {
  if (arrays.length === 0) return [[]];
  const [first, ...rest] = arrays;
  const remainingCrossProduct = getCrossProduct(...rest);
  return first.flatMap(item => {
    return remainingCrossProduct.map(combo => [item, ...combo]);
  });
}
