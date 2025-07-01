
export const allCategories = [
    // Top-level categories
    { id: 'cat-phones', name: 'Smartphones & Wearables', slug: 'smartphones-wearables', image: 'https://placehold.co/400x300/3b82f6/ffffff.png', parentId: null },
    { id: 'cat-computers', name: 'Computers & Laptops', slug: 'computers-laptops', image: 'https://placehold.co/400x300/10b981/ffffff.png', parentId: null },
    { id: 'cat-audio', name: 'Audio & Sound', slug: 'audio-sound', image: 'https://placehold.co/400x300/f59e0b/ffffff.png', parentId: null },
    { id: 'cat-cameras', name: 'Cameras & Drones', slug: 'cameras-drones', image: 'https://placehold.co/400x300/ef4444/ffffff.png', parentId: null },
    { id: 'cat-gaming', name: 'Gaming & Consoles', slug: 'gaming-consoles', image: 'https://placehold.co/400x300/6366f1/ffffff.png', parentId: null },
    { id: 'cat-accessories', name: 'Peripherals & Accessories', slug: 'peripherals-accessories', image: 'https://placehold.co/400x300/8b5cf6/ffffff.png', parentId: null },

    // Sub-categories
    { id: 'cat-smartphones', name: 'Smartphones', slug: 'smartphones', image: 'https://placehold.co/400x300/60a5fa/ffffff.png', parentId: 'cat-phones' },
    { id: 'cat-smartwatches', name: 'Smartwatches', slug: 'smartwatches', image: 'https://placehold.co/400x300/93c5fd/ffffff.png', parentId: 'cat-phones' },
    { id: 'cat-laptops', name: 'Laptops', slug: 'laptops', image: 'https://placehold.co/400x300/34d399/ffffff.png', parentId: 'cat-computers' },
    { id: 'cat-desktops', name: 'Desktops', slug: 'desktops', image: 'https://placehold.co/400x300/6ee7b7/ffffff.png', parentId: 'cat-computers' },
    { id: 'cat-monitors', name: 'Monitors', slug: 'monitors', image: 'https://placehold.co/400x300/a7f3d0/ffffff.png', parentId: 'cat-computers' },
    { id: 'cat-headphones', name: 'Headphones', slug: 'headphones', image: 'https://placehold.co/400x300/fbbf24/ffffff.png', parentId: 'cat-audio' },
    { id: 'cat-speakers', name: 'Speakers', slug: 'speakers', image: 'https://placehold.co/400x300/fcd34d/ffffff.png', parentId: 'cat-audio' },
    { id: 'cat-dslr', name: 'DSLR Cameras', slug: 'dslr-cameras', image: 'https://placehold.co/400x300/f87171/ffffff.png', parentId: 'cat-cameras' },
    { id: 'cat-drones', name: 'Drones', slug: 'drones', image: 'https://placehold.co/400x300/fb7185/ffffff.png', parentId: 'cat-cameras' },
];

export const allProducts = [
  // Smartphones (2)
  {
    id: 'prod-auraphone-pro',
    name: 'AuraPhone X Pro',
    slug: 'auraphone-x-pro',
    shortDescription: 'Capture your world like never before with the triple-lens camera system.',
    description: 'The AuraPhone X Pro pushes the boundaries of innovation. Its ProMotion XDR display, cinematic mode video, and aerospace-grade materials make it the ultimate smartphone for professionals and enthusiasts.',
    categoryId: 'cat-smartphones',
    images: JSON.stringify(['https://placehold.co/600x600/1e293b/ffffff.png', 'https://placehold.co/600x600/f1f5f9/000000.png', 'https://placehold.co/600x600/64748b/ffffff.png', 'https://placehold.co/600x600/94a3b8/000000.png']),
    mainImage: 'https://placehold.co/600x600/1e293b/ffffff.png',
    optionGroups: JSON.stringify([
        { type: 'color', name: 'Color', options: [{ value: 'Graphite', color_hex: '#1e293b' }, { value: 'Silver', color_hex: '#f1f5f9' }, { value: 'Sierra Blue', color_hex: '#64748b' }] },
        { type: 'default', name: 'Storage', options: [{ value: '256GB' }, { value: '512GB' }, { value: '1TB' }] }
    ]),
    tags: 'smartphone, flagship, pro, new, sale',
    isFeatured: true,
    isOnOffer: true,
    weight: 0.204,
    dimensions: '146.7 x 71.5 x 7.65 mm',
    variants: [
      { id: 'var-p1-1', name: 'Graphite, 256GB', price: 1199, salePrice: 1099, image: 'https://placehold.co/600x600/1e293b/ffffff.png', stock: 20, options: JSON.stringify({ Color: 'Graphite', Storage: '256GB'}) },
      { id: 'var-p1-2', name: 'Silver, 512GB', price: 1399, salePrice: 1299, image: 'https://placehold.co/600x600/f1f5f9/000000.png', stock: 15, options: JSON.stringify({ Color: 'Silver', Storage: '512GB'}) },
      { id: 'var-p1-3', name: 'Sierra Blue, 1TB', price: 1599, salePrice: 1499, image: 'https://placehold.co/600x600/64748b/ffffff.png', stock: 10, options: JSON.stringify({ Color: 'Sierra Blue', Storage: '1TB'}) },
    ],
  },
  {
    id: 'prod-pixel-8',
    name: 'Pixel Perfect 8',
    slug: 'pixel-perfect-8',
    shortDescription: 'The smart, helpful phone with an amazing AI-powered camera.',
    description: 'The Pixel Perfect 8 is designed around you. With a brilliant display, a battery that lasts all day, and a camera that takes stunning photos in any light, it\'s the smart choice for everyone.',
    categoryId: 'cat-smartphones',
    images: JSON.stringify(['https://placehold.co/600x600/fefce8/000000.png', 'https://placehold.co/600x600/ecfccb/000000.png', 'https://placehold.co/600x600/dbeafe/000000.png']),
    mainImage: 'https://placehold.co/600x600/fefce8/000000.png',
    optionGroups: JSON.stringify([
      { type: 'color', name: 'Color', options: [{ value: 'Lemon', color_hex: '#fefce8'}, { value: 'Mint', color_hex: '#ecfccb'}, { value: 'Sky', color_hex: '#dbeafe'}] },
      { type: 'default', name: 'Storage', options: [{ value: '128GB' }, { value: '256GB' }] }
    ]),
    tags: 'smartphone, android, ai, camera',
    isFeatured: false,
    isOnOffer: false,
    weight: 0.187,
    dimensions: '150.5 x 70.8 x 8.9 mm',
    variants: [
      { id: 'var-p2-1', name: 'Lemon, 128GB', price: 799, salePrice: null, image: 'https://placehold.co/600x600/fefce8/000000.png', stock: 30, options: JSON.stringify({ Color: 'Lemon', Storage: '128GB'}) },
      { id: 'var-p2-2', name: 'Mint, 128GB', price: 799, salePrice: null, image: 'https://placehold.co/600x600/ecfccb/000000.png', stock: 25, options: JSON.stringify({ Color: 'Mint', Storage: '128GB'}) },
      { id: 'var-p2-3', name: 'Sky, 256GB', price: 899, salePrice: null, image: 'https://placehold.co/600x600/dbeafe/000000.png', stock: 20, options: JSON.stringify({ Color: 'Sky', Storage: '256GB'}) },
    ],
  },
  // Laptops (2)
  {
    id: 'prod-zenith-14',
    name: 'Zenith Laptop 14',
    slug: 'zenith-laptop-14',
    shortDescription: 'Ultra-portable design meets all-day performance.',
    description: 'The Zenith Laptop 14 is the perfect companion for those on the move. Weighing just 1.2kg, it packs a vibrant 14-inch display, the latest generation processor, and a battery that won\'t quit.',
    categoryId: 'cat-laptops',
    images: JSON.stringify(['https://placehold.co/600x600/4b5563/ffffff.png', 'https://placehold.co/600x600/d1d5db/000000.png']),
    mainImage: 'https://placehold.co/600x600/4b5563/ffffff.png',
    optionGroups: JSON.stringify([
      { type: 'default', name: 'Processor', options: [{ value: 'Core i5' }, { value: 'Core i7' }] },
      { type: 'default', name: 'Memory', options: [{ value: '16GB RAM' }, { value: '32GB RAM' }] }
    ]),
    tags: 'laptop, ultrabook, portable, work',
    isFeatured: true,
    isOnOffer: false,
    weight: 1.2,
    dimensions: '312 x 221 x 14.9 mm',
    variants: [
      { id: 'var-p3-1', name: 'Core i5, 16GB RAM', price: 1299, salePrice: null, image: 'https://placehold.co/600x600/4b5563/ffffff.png', stock: 18, options: JSON.stringify({ Processor: 'Core i5', Memory: '16GB RAM'}) },
      { id: 'var-p3-2', name: 'Core i7, 32GB RAM', price: 1699, salePrice: null, image: 'https://placehold.co/600x600/d1d5db/000000.png', stock: 12, options: JSON.stringify({ Processor: 'Core i7', Memory: '32GB RAM'}) },
    ],
  },
  {
    id: 'prod-blade-16',
    name: 'Blade Gaming Laptop 16',
    slug: 'blade-gaming-laptop-16',
    shortDescription: 'Dominate the competition with unparalleled gaming performance.',
    description: 'Experience desktop-class gaming on the go with the Blade 16. Featuring a high-refresh-rate display, top-tier graphics card, and an advanced cooling system to handle any AAA title you throw at it.',
    categoryId: 'cat-laptops',
    images: JSON.stringify(['https://placehold.co/600x600/000000/059669.png', 'https://placehold.co/600x600/111827/ffffff.png']),
    mainImage: 'https://placehold.co/600x600/000000/059669.png',
    optionGroups: JSON.stringify([
        { type: 'default', name: 'Graphics', options: [{ value: 'RTX 4070' }, { value: 'RTX 4080' }] }
    ]),
    tags: 'laptop, gaming, performance, rtx',
    isFeatured: false,
    isOnOffer: true,
    weight: 2.45,
    dimensions: '355 x 244 x 22 mm',
    variants: [
      { id: 'var-p4-1', name: 'RTX 4070', price: 2499, salePrice: 2299, image: 'https://placehold.co/600x600/000000/059669.png', stock: 10, options: JSON.stringify({ Graphics: 'RTX 4070' }) },
      { id: 'var-p4-2', name: 'RTX 4080', price: 2999, salePrice: 2799, image: 'https://placehold.co/600x600/000000/059669.png', stock: 5, options: JSON.stringify({ Graphics: 'RTX 4080' }) },
    ],
  },
  // Audio (2)
  {
    id: 'prod-sonicbloom-buds',
    name: 'SonicBloom Earbuds',
    slug: 'sonicbloom-earbuds',
    shortDescription: 'Crystal-clear audio and a weightless, comfortable fit.',
    description: 'The SonicBloom Earbuds are engineered for all-day comfort and exceptional sound quality. With custom-tuned drivers and long-lasting battery, they are your perfect audio companion.',
    categoryId: 'cat-headphones',
    images: JSON.stringify(['https://placehold.co/600x600/e0e7ff/000000.png', 'https://placehold.co/600x600/dcfce7/000000.png', 'https://placehold.co/600x600/f3e8ff/000000.png']),
    mainImage: 'https://placehold.co/600x600/e0e7ff/000000.png',
    optionGroups: JSON.stringify([
      { type: 'color', name: 'Color', options: [{ value: 'Lavender', color_hex: '#e0e7ff'}, { value: 'Mint', color_hex: '#dcfce7'}, { value: 'Purple', color_hex: '#f3e8ff'}] }
    ]),
    tags: 'audio, earbuds, wireless, new',
    isFeatured: true,
    isOnOffer: false,
    weight: 0.05,
    dimensions: '50 x 50 x 25 mm',
    variants: [
      { id: 'var-p5-1', name: 'Lavender', price: 149, salePrice: null, image: 'https://placehold.co/600x600/e0e7ff/000000.png', stock: 50, options: JSON.stringify({ Color: 'Lavender' }) },
      { id: 'var-p5-2', name: 'Mint', price: 149, salePrice: null, image: 'https://placehold.co/600x600/dcfce7/000000.png', stock: 40, options: JSON.stringify({ Color: 'Mint' }) },
      { id: 'var-p5-3', name: 'Purple', price: 149, salePrice: null, image: 'https://placehold.co/600x600/f3e8ff/000000.png', stock: 35, options: JSON.stringify({ Color: 'Purple' }) },
    ],
  },
  {
    id: 'prod-resonance-speaker',
    name: 'Resonance Bluetooth Speaker',
    slug: 'resonance-speaker',
    shortDescription: 'Fill any room with rich, 360-degree sound.',
    description: 'The Resonance Speaker delivers powerful, immersive sound in a compact design. With its waterproof build and 12-hour battery life, it\'s ready for any adventure, indoors or out.',
    categoryId: 'cat-speakers',
    images: JSON.stringify(['https://placehold.co/600x600/374151/ffffff.png', 'https://placehold.co/600x600/be123c/ffffff.png']),
    mainImage: 'https://placehold.co/600x600/374151/ffffff.png',
    optionGroups: JSON.stringify([
      { type: 'color', name: 'Color', options: [{ value: 'Graphite', color_hex: '#374151'}, { value: 'Crimson', color_hex: '#be123c'}] }
    ]),
    tags: 'audio, speaker, bluetooth, portable',
    isFeatured: false,
    isOnOffer: false,
    weight: 0.54,
    dimensions: '168 x 67 x 67 mm',
    variants: [
      { id: 'var-p6-1', name: 'Graphite', price: 99, salePrice: null, image: 'https://placehold.co/600x600/374151/ffffff.png', stock: 60, options: JSON.stringify({ Color: 'Graphite'}) },
      { id: 'var-p6-2', name: 'Crimson', price: 99, salePrice: null, image: 'https://placehold.co/600x600/be123c/ffffff.png', stock: 45, options: JSON.stringify({ Color: 'Crimson'}) },
    ],
  },
  // Cameras & Drones (2)
  {
    id: 'prod-apex-dslr',
    name: 'Apex DSLR Camera',
    slug: 'apex-dslr',
    shortDescription: 'Pro-level photography with a full-frame sensor.',
    description: 'The Apex DSLR combines a high-resolution full-frame sensor with a robust and weather-sealed body. Perfect for professionals who demand the best in image quality and reliability.',
    categoryId: 'cat-dslr',
    images: JSON.stringify(['https://placehold.co/600x600/0c0a09/ffffff.png']),
    mainImage: 'https://placehold.co/600x600/0c0a09/ffffff.png',
    optionGroups: JSON.stringify([
      { type: 'default', name: 'Kit', options: [{ value: 'Body Only' }, { value: '24-105mm Kit Lens' }] }
    ]),
    tags: 'camera, dslr, photography, professional',
    isFeatured: false,
    isOnOffer: false,
    weight: 0.89,
    dimensions: '150 x 116 x 76 mm',
    variants: [
      { id: 'var-p7-1', name: 'Body Only', price: 2499, salePrice: null, image: 'https://placehold.co/600x600/0c0a09/ffffff.png', stock: 15, options: JSON.stringify({ Kit: 'Body Only' }) },
      { id: 'var-p7-2', name: '24-105mm Kit Lens', price: 3399, salePrice: null, image: 'https://placehold.co/600x600/0c0a09/ffffff.png', stock: 10, options: JSON.stringify({ Kit: '24-105mm Kit Lens' }) },
    ],
  },
  {
    id: 'prod-stratus-drone',
    name: 'Stratus Drone 4K',
    slug: 'stratus-drone-4k',
    shortDescription: 'Capture stunning aerial footage with this easy-to-fly drone.',
    description: 'Explore the skies with the Stratus Drone 4K. It features a 3-axis gimbal for smooth video, intelligent flight modes, and a compact, foldable design for ultimate portability.',
    categoryId: 'cat-drones',
    images: JSON.stringify(['https://placehold.co/600x600/e2e8f0/000000.png']),
    mainImage: 'https://placehold.co/600x600/e2e8f0/000000.png',
    optionGroups: "[]",
    tags: 'drone, 4k, aerial, video, sale',
    isFeatured: true,
    isOnOffer: true,
    weight: 0.249,
    dimensions: '145×90×56 mm (folded)',
    variants: [
      { id: 'var-p8-1', name: 'Standard Kit', price: 499, salePrice: 449, image: 'https://placehold.co/600x600/e2e8f0/000000.png', stock: 25, options: JSON.stringify({}) },
    ],
  },
  // Gaming (1)
  {
    id: 'prod-ember-console',
    name: 'Ember Gaming Console',
    slug: 'ember-gaming-console',
    shortDescription: 'The next generation of console gaming is here.',
    description: 'Experience lightning-fast loading with an ultra-high-speed SSD, deeper immersion with support for haptic feedback, adaptive triggers and 3D Audio, and an all-new generation of incredible games.',
    categoryId: 'cat-gaming',
    images: JSON.stringify(['https://placehold.co/600x600/172554/ffffff.png', 'https://placehold.co/600x600/fef2f2/000000.png']),
    mainImage: 'https://placehold.co/600x600/172554/ffffff.png',
    optionGroups: JSON.stringify([
      { type: 'default', name: 'Edition', options: [{ value: 'Standard Edition' }, { value: 'Digital Edition' }] }
    ]),
    tags: 'gaming, console, new, featured',
    isFeatured: true,
    isOnOffer: false,
    weight: 4.5,
    dimensions: '390 x 104 x 260 mm',
    variants: [
      { id: 'var-p9-1', name: 'Standard Edition', price: 499, salePrice: null, image: 'https://placehold.co/600x600/172554/ffffff.png', stock: 30, options: JSON.stringify({ Edition: 'Standard Edition' }) },
      { id: 'var-p9-2', name: 'Digital Edition', price: 399, salePrice: null, image: 'https://placehold.co/600x600/fef2f2/000000.png', stock: 20, options: JSON.stringify({ Edition: 'Digital Edition' }) },
    ],
  },
  // Accessories (1)
  {
    id: 'prod-titan-keyboard',
    name: 'Titan Mechanical Keyboard',
    slug: 'titan-keyboard',
    shortDescription: 'A tactile and responsive typing experience for gamers and professionals.',
    description: 'The Titan Mechanical Keyboard features durable mechanical switches, customizable RGB backlighting, and a solid aluminum frame. Elevate your typing and gaming experience.',
    categoryId: 'cat-accessories',
    images: JSON.stringify(['https://placehold.co/600x600/334155/ffffff.png']),
    mainImage: 'https://placehold.co/600x600/334155/ffffff.png',
    optionGroups: JSON.stringify([
      { type: 'default', name: 'Switch Type', options: [{ value: 'Tactile Brown' }, { value: 'Clicky Blue' }, { value: 'Linear Red' }] }
    ]),
    tags: 'keyboard, mechanical, rgb, gaming, accessory',
    isFeatured: false,
    isOnOffer: false,
    weight: 1.1,
    dimensions: '440 x 130 x 35 mm',
    variants: [
      { id: 'var-p10-1', name: 'Tactile Brown', price: 129, salePrice: null, image: 'https://placehold.co/600x600/334155/ffffff.png', stock: 30, options: JSON.stringify({ "Switch Type": 'Tactile Brown'}) },
      { id: 'var-p10-2', name: 'Clicky Blue', price: 129, salePrice: null, image: 'https://placehold.co/600x600/334155/ffffff.png', stock: 25, options: JSON.stringify({ "Switch Type": 'Clicky Blue'}) },
      { id: 'var-p10-3', name: 'Linear Red', price: 129, salePrice: null, image: 'https://placehold.co/600x600/334155/ffffff.png', stock: 40, options: JSON.stringify({ "Switch Type": 'Linear Red'}) },
    ],
  },
  // Smartwatches (1)
  {
    id: 'prod-orbit-watch-8',
    name: 'Orbit Smartwatch Series 8',
    slug: 'orbit-smartwatch-8',
    shortDescription: 'The future of health on your wrist.',
    description: 'The Orbit Smartwatch Series 8 features advanced health sensors, a beautiful always-on display, and seamless integration with your phone. Track workouts, monitor your well-being, and stay connected.',
    categoryId: 'cat-smartwatches',
    images: JSON.stringify(['https://placehold.co/600x600/facc15/000000.png', 'https://placehold.co/600x600/1f2937/ffffff.png', 'https://placehold.co/600x600/ef4444/ffffff.png']),
    mainImage: 'https://placehold.co/600x600/facc15/000000.png',
    optionGroups: JSON.stringify([
      { type: 'color', name: 'Case Color', options: [{ value: 'Gold', color_hex: '#facc15'}, { value: 'Midnight', color_hex: '#1f2937'}, { value: 'Red', color_hex: '#ef4444'}] },
      { type: 'default', name: 'Size', options: [{ value: '41mm' }, { value: '45mm' }] }
    ]),
    tags: 'smartwatch, wearable, health, fitness, new',
    isFeatured: true,
    isOnOffer: false,
    weight: 0.038,
    dimensions: '45 x 38 x 10.7 mm',
    variants: [
      { id: 'var-p11-1', name: 'Gold, 41mm', price: 399, salePrice: null, image: 'https://placehold.co/600x600/facc15/000000.png', stock: 22, options: JSON.stringify({ "Case Color": 'Gold', Size: '41mm'}) },
      { id: 'var-p11-2', name: 'Midnight, 45mm', price: 429, salePrice: null, image: 'https://placehold.co/600x600/1f2937/ffffff.png', stock: 18, options: JSON.stringify({ "Case Color": 'Midnight', Size: '45mm'}) },
      { id: 'var-p11-3', name: 'Red, 45mm', price: 429, salePrice: null, image: 'https://placehold.co/600x600/ef4444/ffffff.png', stock: 15, options: JSON.stringify({ "Case Color": 'Red', Size: '45mm'}) },
    ],
  },
   // Monitors (1)
  {
    id: 'prod-novaview-4k',
    name: 'NovaView 4K Monitor',
    slug: 'novaview-4k',
    shortDescription: 'Stunning 4K clarity and vibrant colors for creative professionals.',
    description: 'The NovaView 4K Monitor delivers exceptional detail and color accuracy, making it ideal for photo and video editing. Its minimalist design and ergonomic stand complement any workspace.',
    categoryId: 'cat-monitors',
    images: JSON.stringify(['https://placehold.co/600x600/e5e7eb/000000.png']),
    mainImage: 'https://placehold.co/600x600/e5e7eb/000000.png',
    optionGroups: JSON.stringify([
      { type: 'default', name: 'Size', options: [{ value: '27-inch' }, { value: '32-inch' }] }
    ]),
    tags: 'monitor, 4k, display, professional',
    isFeatured: false,
    isOnOffer: false,
    weight: 6.3,
    dimensions: '613 x 364 x 45 mm',
    variants: [
      { id: 'var-p12-1', name: '27-inch', price: 599, salePrice: null, image: 'https://placehold.co/600x600/e5e7eb/000000.png', stock: 20, options: JSON.stringify({ Size: '27-inch'}) },
      { id: 'var-p12-2', name: '32-inch', price: 799, salePrice: null, image: 'https://placehold.co/600x600/e5e7eb/000000.png', stock: 15, options: JSON.stringify({ Size: '32-inch'}) },
    ],
  },
  // Headphones (1)
  {
    id: 'prod-silence-anc',
    name: 'Silence ANC Headphones',
    slug: 'silence-anc-headphones',
    shortDescription: 'Escape the noise and focus with best-in-class noise cancellation.',
    description: 'Silence ANC Headphones provide an unparalleled listening experience. With industry-leading active noise cancellation, plush earcups, and up to 30 hours of battery life, they are perfect for travel and concentration.',
    categoryId: 'cat-headphones',
    images: JSON.stringify(['https://placehold.co/600x600/9ca3af/ffffff.png', 'https://placehold.co/600x600/fdf2f8/000000.png']),
    mainImage: 'https://placehold.co/600x600/9ca3af/ffffff.png',
    optionGroups: JSON.stringify([
      { type: 'color', name: 'Color', options: [{ value: 'Silver', color_hex: '#9ca3af'}, { value: 'Rose Gold', color_hex: '#fdf2f8'}] }
    ]),
    tags: 'headphones, audio, anc, wireless, sale',
    isFeatured: false,
    isOnOffer: true,
    weight: 0.254,
    dimensions: '195 x 165 x 76 mm',
    variants: [
      { id: 'var-p13-1', name: 'Silver', price: 349, salePrice: 299, image: 'https://placehold.co/600x600/9ca3af/ffffff.png', stock: 25, options: JSON.stringify({ Color: 'Silver'}) },
      { id: 'var-p13-2', name: 'Rose Gold', price: 349, salePrice: 299, image: 'https://placehold.co/600x600/fdf2f8/000000.png', stock: 20, options: JSON.stringify({ Color: 'Rose Gold'}) },
    ],
  },
  // Desktops (1)
  {
    id: 'prod-helios-gaming-pc',
    name: 'Helios Gaming PC',
    slug: 'helios-gaming-pc',
    shortDescription: 'A pre-built gaming beast with extreme performance and stunning aesthetics.',
    description: 'The Helios Gaming PC is engineered for ultimate power. It features the latest high-end components, liquid cooling, and a tempered glass case with customizable RGB lighting to showcase its performance.',
    categoryId: 'cat-desktops',
    images: JSON.stringify(['https://placehold.co/600x600/020617/db2777.png']),
    mainImage: 'https://placehold.co/600x600/020617/db2777.png',
    optionGroups: JSON.stringify([
      { type: 'default', name: 'Configuration', options: [{ value: 'Pro' }, { value: 'Extreme' }] }
    ]),
    tags: 'desktop, pc, gaming, performance, rgb',
    isFeatured: true,
    isOnOffer: false,
    weight: 15,
    dimensions: '500 x 230 x 480 mm',
    variants: [
      { id: 'var-p14-1', name: 'Pro', price: 1999, salePrice: null, image: 'https://placehold.co/600x600/020617/db2777.png', stock: 8, options: JSON.stringify({ Configuration: 'Pro'}) },
      { id: 'var-p14-2', name: 'Extreme', price: 2999, salePrice: null, image: 'https://placehold.co/600x600/020617/db2777.png', stock: 4, options: JSON.stringify({ Configuration: 'Extreme'}) },
    ],
  },
  // Accessories (5)
  {
    id: 'prod-momentum-mouse',
    name: 'Momentum Gaming Mouse',
    slug: 'momentum-mouse',
    shortDescription: 'Lightweight, ergonomic, and incredibly precise for competitive gaming.',
    description: 'Gain a competitive edge with the Momentum Gaming Mouse. Its ultra-lightweight design, flawless sensor, and low-latency wireless technology ensure every movement is tracked with perfect accuracy.',
    categoryId: 'cat-accessories',
    images: JSON.stringify(['https://placehold.co/600x600/18181b/ffffff.png', 'https://placehold.co/600x600/fafafa/000000.png']),
    mainImage: 'https://placehold.co/600x600/18181b/ffffff.png',
    optionGroups: JSON.stringify([
      { type: 'color', name: 'Color', options: [{ value: 'Black', color_hex: '#18181b'}, { value: 'White', color_hex: '#fafafa'}] }
    ]),
    tags: 'mouse, gaming, wireless, accessory, rgb',
    isFeatured: false,
    isOnOffer: false,
    weight: 0.063,
    dimensions: '125 x 63.5 x 40 mm',
    variants: [
      { id: 'var-p15-1', name: 'Black', price: 89, salePrice: null, image: 'https://placehold.co/600x600/18181b/ffffff.png', stock: 50, options: JSON.stringify({ Color: 'Black'}) },
      { id: 'var-p15-2', name: 'White', price: 89, salePrice: null, image: 'https://placehold.co/600x600/fafafa/000000.png', stock: 40, options: JSON.stringify({ Color: 'White'}) },
    ],
  },
  {
    id: 'prod-streamcam-pro',
    name: 'StreamCam Pro',
    slug: 'streamcam-pro',
    shortDescription: 'Full HD 1080p webcam for professional streaming and video calls.',
    description: 'Look your best on every call with the StreamCam Pro. It captures sharp, clear video at 60fps, with smart auto-focus and a versatile mounting system for perfect framing.',
    categoryId: 'cat-accessories',
    images: JSON.stringify(['https://placehold.co/600x600/404040/ffffff.png']),
    mainImage: 'https://placehold.co/600x600/404040/ffffff.png',
    optionGroups: "[]",
    tags: 'webcam, streaming, video, accessory',
    isFeatured: false,
    isOnOffer: false,
    weight: 0.15,
    dimensions: '66 x 58 x 48 mm',
    variants: [
      { id: 'var-p16-1', name: 'Default', price: 169, salePrice: null, image: 'https://placehold.co/600x600/404040/ffffff.png', stock: 35, options: JSON.stringify({}) },
    ],
  },
  {
    id: 'prod-powercore-elite',
    name: 'PowerCore Elite',
    slug: 'powercore-elite',
    shortDescription: 'High-capacity portable charger for all your devices.',
    description: 'Never run out of power with the PowerCore Elite. A high-capacity portable charger that can power up your phone, laptop, and other devices multiple times over.',
    categoryId: 'cat-accessories',
    images: JSON.stringify(['https://placehold.co/600x600/464646/ffffff.png']),
    mainImage: 'https://placehold.co/600x600/464646/ffffff.png',
    optionGroups: "[]",
    tags: 'powerbank, charger, accessory, portable',
    isFeatured: false,
    isOnOffer: false,
    weight: 0.495,
    dimensions: '180 x 82 x 22 mm',
    variants: [
      { id: 'var-p17-1', name: '26,800mAh', price: 65, salePrice: null, image: 'https://placehold.co/600x600/464646/ffffff.png', stock: 100, options: JSON.stringify({}) },
    ]
  },
  {
    id: 'prod-deskpad-pro',
    name: 'DeskPad Pro',
    slug: 'deskpad-pro',
    shortDescription: 'Premium, oversized desk mat for a smooth workspace.',
    description: 'Upgrade your workspace with the DeskPad Pro. A premium, oversized desk mat that provides a smooth surface for your mouse and keyboard, with a non-slip base.',
    categoryId: 'cat-accessories',
    images: JSON.stringify(['https://placehold.co/600x600/d3d3d3/000000.png', 'https://placehold.co/600x600/008080/ffffff.png']),
    mainImage: 'https://placehold.co/600x600/d3d3d3/000000.png',
    optionGroups: JSON.stringify([
      { type: 'color', name: 'Color', options: [{ value: 'Light Gray', color_hex: '#d3d3d3' }, { value: 'Dark Teal', color_hex: '#008080' }] }
    ]),
    tags: 'deskmat, accessory, workspace',
    isFeatured: false,
    isOnOffer: false,
    weight: 0.8,
    dimensions: '900 x 400 x 4 mm',
    variants: [
      { id: 'var-p18-1', name: 'Light Gray', price: 35, salePrice: null, image: 'https://placehold.co/600x600/d3d3d3/000000.png', stock: 75, options: JSON.stringify({ Color: 'Light Gray' }) },
      { id: 'var-p18-2', name: 'Dark Teal', price: 35, salePrice: null, image: 'https://placehold.co/600x600/008080/ffffff.png', stock: 60, options: JSON.stringify({ Color: 'Dark Teal' }) },
    ]
  },
  {
    id: 'prod-flow-dock',
    name: 'Flow Dock 7-in-1',
    slug: 'flow-dock-7-in-1',
    shortDescription: 'Expand your laptop\'s connectivity with this powerful USB-C hub.',
    description: 'The Flow Dock is a versatile 7-in-1 USB-C hub that adds 4K HDMI, USB 3.0 ports, an SD card reader, and more to your laptop, all from a single port.',
    categoryId: 'cat-accessories',
    images: JSON.stringify(['https://placehold.co/600x600/808080/ffffff.png']),
    mainImage: 'https://placehold.co/600x600/808080/ffffff.png',
    optionGroups: "[]",
    tags: 'usb-c, hub, dock, accessory, productivity',
    isFeatured: false,
    isOnOffer: true,
    weight: 0.1,
    dimensions: '115 x 50 x 15 mm',
    variants: [
      { id: 'var-p19-1', name: 'Default', price: 59, salePrice: 49, image: 'https://placehold.co/600x600/808080/ffffff.png', stock: 80, options: JSON.stringify({}) },
    ]
  },
  // Final Product
  {
    id: 'prod-studio-mic',
    name: 'Studio Mic Pro',
    slug: 'studio-mic-pro',
    shortDescription: 'Broadcast-quality USB microphone for podcasting and recording.',
    description: 'Achieve professional sound with the Studio Mic Pro. This USB microphone delivers rich, detailed audio and features a headphone jack for zero-latency monitoring, perfect for streamers and musicians.',
    categoryId: 'cat-audio',
    images: JSON.stringify(['https://placehold.co/600x600/262626/ffffff.png']),
    mainImage: 'https://placehold.co/600x600/262626/ffffff.png',
    optionGroups: "[]",
    tags: 'microphone, audio, recording, podcast, streaming',
    isFeatured: false,
    isOnOffer: false,
    weight: 0.55,
    dimensions: '290 x 120 x 125 mm',
    variants: [
      { id: 'var-p20-1', name: 'Default', price: 129, salePrice: null, image: 'https://placehold.co/600x600/262626/ffffff.png', stock: 40, options: JSON.stringify({}) },
    ]
  },
];
