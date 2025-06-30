import type { Product, Category } from './types';

export const allCategories: Category[] = [
  { id: 'cat1', name: 'Smartphones', slug: 'smartphones' },
  { id: 'cat2', name: 'Laptops', slug: 'laptops' },
  { id: 'cat3', name: 'Audio', slug: 'audio' },
  { id: 'cat4', name: 'Accessories', slug: 'accessories' },
];

export const allProducts: Product[] = [
  {
    id: 'prod1',
    name: 'AuraPhone X',
    slug: 'auraphone-x',
    description: 'Experience the next generation of mobile technology with the AuraPhone X. Featuring a stunning edge-to-edge display, a powerful A-series chip, and a revolutionary camera system.',
    categoryId: 'cat1',
    variants: [
      { id: 'var1a', name: 'Starlight, 128GB', price: 999, image: 'https://placehold.co/600x600/E8F0F2/242424.png', stock: 15 },
      { id: 'var1b', name: 'Midnight, 256GB', price: 1099, image: 'https://placehold.co/600x600/222222/ffffff.png', stock: 10 },
      { id: 'var1c', name: 'Electric Blue, 512GB', price: 1299, image: 'https://placehold.co/600x600/7DF9FF/000000.png', stock: 5 },
    ],
  },
  {
    id: 'prod2',
    name: 'ZenBook Pro',
    slug: 'zenbook-pro',
    description: 'Unleash your creative potential with the ZenBook Pro. A sleek, lightweight powerhouse with a breathtaking 4K OLED display and the latest high-performance processors for ultimate productivity.',
    categoryId: 'cat2',
    variants: [
      { id: 'var2a', name: '16GB RAM, 512GB SSD', price: 1499, image: 'https://placehold.co/600x600/c0c0c0/000000.png', stock: 8 },
      { id: 'var2b', name: '32GB RAM, 1TB SSD', price: 1999, image: 'https://placehold.co/600x600/a9a9a9/ffffff.png', stock: 3 },
    ],
  },
  {
    id: 'prod3',
    name: 'EchoBuds Pro',
    slug: 'echobuds-pro',
    description: 'Immerse yourself in pure sound with EchoBuds Pro. Active noise cancellation, a comfortable and secure fit, and crystal-clear audio for music and calls on the go.',
    categoryId: 'cat3',
    variants: [
      { id: 'var3a', name: 'Glacier White', price: 199, image: 'https://placehold.co/600x600/f5f5f5/000000.png', stock: 50 },
      { id: 'var3b', name: 'Charcoal Black', price: 199, image: 'https://placehold.co/600x600/333333/ffffff.png', stock: 40 },
    ],
  },
  {
    id: 'prod4',
    name: 'NovaWatch SE',
    slug: 'novawatch-se',
    description: 'Stay connected, active, and healthy with the NovaWatch SE. Track your workouts, monitor your health, and get all your notifications right on your wrist in a stylish package.',
    categoryId: 'cat4',
    variants: [
      { id: 'var4a', name: 'Silver Aluminum Case', price: 279, image: 'https://placehold.co/600x600/silver/000000.png', stock: 25 },
      { id: 'var4b', name: 'Space Gray Aluminum Case', price: 279, image: 'https://placehold.co/600x600/555555/ffffff.png', stock: 22 },
    ],
  },
  {
    id: 'prod5',
    name: 'PowerCore Elite',
    slug: 'powercore-elite',
    description: 'Never run out of power with the PowerCore Elite. A high-capacity portable charger that can power up your phone, laptop, and other devices multiple times over.',
    categoryId: 'cat4',
    variants: [
        { id: 'var5a', name: '26,800mAh', price: 65, image: 'https://placehold.co/600x600/464646/ffffff.png', stock: 100 },
    ]
  },
  {
    id: 'prod6',
    name: 'DeskPad Pro',
    slug: 'deskpad-pro',
    description: 'Upgrade your workspace with the DeskPad Pro. A premium, oversized desk mat that provides a smooth surface for your mouse and keyboard, with a non-slip base.',
    categoryId: 'cat4',
    variants: [
        { id: 'var6a', name: 'Light Gray', price: 35, image: 'https://placehold.co/600x600/d3d3d3/000000.png', stock: 75 },
        { id: 'var6b', name: 'Dark Teal', price: 35, image: 'https://placehold.co/600x600/008080/ffffff.png', stock: 60 },
    ]
  }
];

export function getProductBySlug(slug: string): Product | undefined {
  return allProducts.find((p) => p.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return allProducts.find((p) => p.id === id);
}
