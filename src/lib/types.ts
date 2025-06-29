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
  color_hex: string | null;
  options: string | { [key: string]: string }; // JSON string from DB, object in app
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  vendorId: number;
  optionGroups?: string | null; // JSON string
  variants: ProductVariant[];
  tags?: string;
  isFeatured?: boolean;
  isOnOffer?: boolean;
  weight?: number;
  dimensions?: string;
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

export type Role = {
  id: number;
  name: string;
};

export type Address = {
  id: number;
  user_id: number;
  fullName: string;
  street: string;
  apartment?: string;
  city: string;
  state?: string;
  zip: string;
  country: string;
  isPrimary: boolean;
};
