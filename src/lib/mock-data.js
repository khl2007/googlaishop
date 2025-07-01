

export const allCategories = [
  { id: 'cat1', name: 'Smartphones', slug: 'smartphones', image: 'https://placehold.co/400x300.png', parentId: null },
  { id: 'cat2', name: 'Laptops', slug: 'laptops', image: 'https://placehold.co/400x300.png', parentId: null },
  { id: 'cat3', name: 'Audio', slug: 'audio', image: 'https://placehold.co/400x300.png', parentId: null },
  { id: 'cat4', name: 'Accessories', slug: 'accessories', image: 'https://placehold.co/400x300.png', parentId: null },
];

export const allProducts = [
  {
    id: 'prod1',
    name: 'AuraPhone X',
    slug: 'auraphone-x',
    shortDescription: 'The future in your hands, with a stunning display and revolutionary camera.',
    description: 'Experience the next generation of mobile technology with the AuraPhone X. Featuring a stunning edge-to-edge display, a powerful A-series chip, and a revolutionary camera system.',
    categoryId: 'cat1',
    images: JSON.stringify([
      'https://placehold.co/600x600/E8F0F2/242424.png',
      'https://placehold.co/600x600/222222/ffffff.png',
      'https://placehold.co/600x600/7DF9FF/000000.png',
      'https://placehold.co/600x600/f5f5f5/000000.png'
    ]),
    mainImage: 'https://placehold.co/600x600/E8F0F2/242424.png',
    optionGroups: JSON.stringify([
        { type: 'color', name: 'Color', options: [{ value: 'Starlight', color_hex: '#E8F0F2', image: 'https://placehold.co/600x600/E8F0F2/242424.png'}, { value: 'Midnight', color_hex: '#222222', image: 'https://placehold.co/600x600/222222/ffffff.png'}, { value: 'Electric Blue', color_hex: '#7DF9FF', image: 'https://placehold.co/600x600/7DF9FF/000000.png'}]},
        { type: 'default', name: 'Storage', options: [{ value: '128GB' }, { value: '256GB' }, { value: '512GB' }] }
    ]),
    tags: 'smartphone, flagship, new',
    isFeatured: true,
    isOnOffer: false,
    weight: 0.174, // in kg
    dimensions: '146.7 x 71.5 x 7.7 mm',
    variants: [
      { id: 'var1a', name: 'Starlight, 128GB', price: 999, salePrice: null, image: 'https://placehold.co/600x600/E8F0F2/242424.png', stock: 15, options: JSON.stringify({ Color: 'Starlight', Storage: '128GB'}) },
      { id: 'var1b', name: 'Starlight, 256GB', price: 1099, salePrice: null, image: 'https://placehold.co/600x600/E8F0F2/242424.png', stock: 10, options: JSON.stringify({ Color: 'Starlight', Storage: '256GB'}) },
      { id: 'var1c', name: 'Midnight, 256GB', price: 1099, salePrice: null, image: 'https://placehold.co/600x600/222222/ffffff.png', stock: 10, options: JSON.stringify({ Color: 'Midnight', Storage: '256GB'}) },
      { id: 'var1d', name: 'Electric Blue, 512GB', price: 1299, salePrice: null, image: 'https://placehold.co/600x600/7DF9FF/000000.png', stock: 5, options: JSON.stringify({ Color: 'Electric Blue', Storage: '512GB'}) },
    ],
  },
  {
    id: 'prod2',
    name: 'ZenBook Pro',
    slug: 'zenbook-pro',
    shortDescription: 'A sleek, lightweight powerhouse for ultimate creativity and productivity.',
    description: 'Unleash your creative potential with the ZenBook Pro. A sleek, lightweight powerhouse with a breathtaking 4K OLED display and the latest high-performance processors for ultimate productivity.',
    categoryId: 'cat2',
    images: JSON.stringify([
      'https://placehold.co/600x600/c0c0c0/000000.png',
      'https://placehold.co/600x600/a9a9a9/ffffff.png',
    ]),
    mainImage: 'https://placehold.co/600x600/c0c0c0/000000.png',
    optionGroups: JSON.stringify([
        { type: 'default', name: 'Configuration', options: [{value: '16GB RAM, 512GB SSD'}, {value: '32GB RAM, 1TB SSD'}] }
    ]),
    tags: 'laptop, productivity, oled, sale',
    isFeatured: true,
    isOnOffer: true,
    weight: 1.8,
    dimensions: '356 x 235 x 17 mm',
    variants: [
      { id: 'var2a', name: '16GB RAM, 512GB SSD', price: 1499, salePrice: 1299, image: 'https://placehold.co/600x600/c0c0c0/000000.png', stock: 8, options: JSON.stringify({ Configuration: '16GB RAM, 512GB SSD' }) },
      { id: 'var2b', name: '32GB RAM, 1TB SSD', price: 1999, salePrice: 1749, image: 'https://placehold.co/600x600/a9a9a9/ffffff.png', stock: 3, options: JSON.stringify({ Configuration: '32GB RAM, 1TB SSD' }) },
    ],
  },
  {
    id: 'prod3',
    name: 'EchoBuds Pro',
    slug: 'echobuds-pro',
    shortDescription: 'Immerse yourself in pure sound with active noise cancellation.',
    description: 'Immerse yourself in pure sound with EchoBuds Pro. Active noise cancellation, a comfortable and secure fit, and crystal-clear audio for music and calls on the go.',
    categoryId: 'cat3',
    images: JSON.stringify([
        'https://placehold.co/600x600/f5f5f5/000000.png',
        'https://placehold.co/600x600/333333/ffffff.png'
    ]),
    mainImage: 'https://placehold.co/600x600/f5f5f5/000000.png',
    optionGroups: JSON.stringify([
      { type: 'color', name: 'Color', options: [{value: 'Glacier White', color_hex: '#f5f5f5'}, {value: 'Charcoal Black', color_hex: '#333333'}] }
    ]),
    tags: 'audio, earbuds, anc',
    isFeatured: false,
    isOnOffer: false,
    weight: 0.06,
    dimensions: '66 x 29 x 39 mm',
    variants: [
      { id: 'var3a', name: 'Glacier White', price: 199, salePrice: null, image: 'https://placehold.co/600x600/f5f5f5/000000.png', stock: 50, options: JSON.stringify({ Color: 'Glacier White' }) },
      { id: 'var3b', name: 'Charcoal Black', price: 199, salePrice: null, image: 'https://placehold.co/600x600/333333/ffffff.png', stock: 40, options: JSON.stringify({ Color: 'Charcoal Black' }) },
    ],
  },
];
