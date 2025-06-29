export type Category = {
  id: string;
  name: string;
  slug: string;
};

export type ProductVariant = {
  id: string;
  name: string;
  price: number;
  image: string;
  stock: number;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  variants: ProductVariant[];
};

export type CartItem = {
  variantId: string;
  productId: string;
  name: string;
  variantName: string;
  price: number;
  image: string;
  quantity: number;
};

export type User = {
  id: number;
  username: string;
  fullName: string;
  role: 'admin' | 'vendor' | 'customer' | 'delivery';
};
