
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
  salePrice?: number | null;
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
  shortDescription?: string | null;
  categoryId: string;
  vendorId: number;
  optionGroups?: string | null; // JSON string
  variants: ProductVariant[];
  tags?: string;
  isFeatured?: boolean;
  isOnOffer?: boolean;
  weight?: number;
  dimensions?: string;
  images?: string | null; // JSON string
  mainImage?: string | null;
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
  isVerified?: boolean;
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
  googleMapUrl?: string | null;
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

export type HomeSection = {
    id: number;
    title: string;
    type: 'category' | 'tag' | 'ai' | 'custom' | 'featured' | 'on_offer';
    config: string | null; // JSON string
    style: string;
    order: number;
    isActive: boolean;
};

export type SliderGroup = {
    id: number;
    name: string;
    location: 'category_top';
    category_id: string | null;
    content_type: 'product_tag';
    tags: string; // JSON array of strings
    slides_per_view: number;
    autoplay_speed: number;
    style: string;
    is_active: boolean;
};
