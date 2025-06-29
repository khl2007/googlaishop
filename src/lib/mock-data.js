export const allCategories = [
  { id: 'cat1', name: 'Smartphones', slug: 'smartphones' },
  { id: 'cat2', name: 'Laptops', slug: 'laptops' },
  { id: 'cat3', name: 'Audio', slug: 'audio' },
  { id: 'cat4', name: 'Accessories', slug: 'accessories' },
];

export const allProducts = [
  {
    id: 'prod1',
    name: 'AuraPhone X',
    slug: 'auraphone-x',
    description: 'Experience the next generation of mobile technology with the AuraPhone X. Featuring a stunning edge-to-edge display, a powerful A-series chip, and a revolutionary camera system.',
    categoryId: 'cat1',
    optionGroups: JSON.stringify([
        { name: 'Color', options: [{ value: 'Starlight', color_hex: '#E8F0F2', image: 'https://placehold.co/600x600/E8F0F2/242424'}, { value: 'Midnight', color_hex: '#222222', image: 'https://placehold.co/600x600/222222/ffffff'}, { value: 'Electric Blue', color_hex: '#7DF9FF', image: 'https://placehold.co/600x600/7DF9FF/000000'}]},
        { name: 'Storage', options: [{ value: '128GB' }, { value: '256GB' }, { value: '512GB' }] }
    ]),
    variants: [
      { id: 'var1a', name: 'Starlight, 128GB', price: 999, image: 'https://placehold.co/600x600/E8F0F2/242424', stock: 15, options: JSON.stringify({ Color: 'Starlight', Storage: '128GB'}) },
      { id: 'var1b', name: 'Starlight, 256GB', price: 1099, image: 'https://placehold.co/600x600/E8F0F2/242424', stock: 10, options: JSON.stringify({ Color: 'Starlight', Storage: '256GB'}) },
      { id: 'var1c', name: 'Midnight, 256GB', price: 1099, image: 'https://placehold.co/600x600/222222/ffffff', stock: 10, options: JSON.stringify({ Color: 'Midnight', Storage: '256GB'}) },
      { id: 'var1d', name: 'Electric Blue, 512GB', price: 1299, image: 'https://placehold.co/600x600/7DF9FF/000000', stock: 5, options: JSON.stringify({ Color: 'Electric Blue', Storage: '512GB'}) },
    ],
  },
  {
    id: 'prod2',
    name: 'ZenBook Pro',
    slug: 'zenbook-pro',
    description: 'Unleash your creative potential with the ZenBook Pro. A sleek, lightweight powerhouse with a breathtaking 4K OLED display and the latest high-performance processors for ultimate productivity.',
    categoryId: 'cat2',
    optionGroups: JSON.stringify([
        { name: 'Configuration', options: [{value: '16GB RAM, 512GB SSD'}, {value: '32GB RAM, 1TB SSD'}] }
    ]),
    variants: [
      { id: 'var2a', name: '16GB RAM, 512GB SSD', price: 1499, image: 'https://placehold.co/600x600/c0c0c0/000000', stock: 8, options: JSON.stringify({ Configuration: '16GB RAM, 512GB SSD' }) },
      { id: 'var2b', name: '32GB RAM, 1TB SSD', price: 1999, image: 'https://placehold.co/600x600/a9a9a9/ffffff', stock: 3, options: JSON.stringify({ Configuration: '32GB RAM, 1TB SSD' }) },
    ],
  },
  {
    id: 'prod3',
    name: 'EchoBuds Pro',
    slug: 'echobuds-pro',
    description: 'Immerse yourself in pure sound with EchoBuds Pro. Active noise cancellation, a comfortable and secure fit, and crystal-clear audio for music and calls on the go.',
    categoryId: 'cat3',
    optionGroups: JSON.stringify([
      { name: 'Color', options: [{value: 'Glacier White', color_hex: '#f5f5f5'}, {value: 'Charcoal Black', color_hex: '#333333'}] }
    ]),
    variants: [
      { id: 'var3a', name: 'Glacier White', price: 199, image: 'https://placehold.co/600x600/f5f5f5/000000', stock: 50, options: JSON.stringify({ Color: 'Glacier White' }) },
      { id: 'var3b', name: 'Charcoal Black', price: 199, image: 'https://placehold.co/600x600/333333/ffffff', stock: 40, options: JSON.stringify({ Color: 'Charcoal Black' }) },
    ],
  },
];
