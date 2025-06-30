export type Category = {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  parentId?: string | null;
  parentName?: string | null;
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
  area?: string | null;
  state?: string;
  zip: string;
  country: string;
  isPrimary: boolean;
};

export type ShippingMethod = {
  id: number;
  title: string;
  logo: string | null;
  cost_type: 'city' | 'area' | 'weight';
  default_cost: number | null;
  config: string; // JSON string
  enabled: boolean;
};

export type ShippingMethodConfig = {
    cost_per_kg?: number;
    overrides?: {
        type: 'city' | 'area';
        locationId: number;
        cost: number;
    }[];
};

export type Slide = {
    id: number;
    title: string;
    description: string;
    image: string;
    link: string;
    buttonText: string;
    isActive: boolean;
    order: number;
};
