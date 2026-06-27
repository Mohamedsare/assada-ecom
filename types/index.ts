export type ProductStatus = "active" | "draft" | "out_of_stock" | "hidden";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "returned";

export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded"
  | "cash_on_delivery";

export type PaymentMethod = "cash_on_delivery" | "airtel_money" | "moov_money";

export type UserRole = "customer" | "admin" | "super_admin" | "delivery_agent";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  parent_id?: string;
  is_active: boolean;
  sort_order: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  description?: string;
  is_active: boolean;
}

export interface Product {
  id: string;
  category_id: string;
  brand_id?: string;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  current_price: number;
  old_price?: number;
  stock_quantity: number;
  sku?: string;
  main_image_url?: string;
  is_featured: boolean;
  is_new: boolean;
  is_promo: boolean;
  status: ProductStatus;
  category?: Category;
  brand?: Brand;
  images?: ProductImage[];
  variants?: ProductVariant[];
  rating?: number;
  review_count?: number;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text?: string;
  sort_order: number;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  color?: string;
  size?: string;
  stock_quantity: number;
  price_adjustment: number;
}

export interface CartItem {
  id: string;
  product: Product;
  variant?: ProductVariant;
  quantity: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email?: string;
  customer_phone: string;
  delivery_city: string;
  delivery_district: string;
  delivery_address_details?: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  subtotal: number;
  delivery_fee: number;
  discount_amount: number;
  total_amount: number;
  estimated_delivery_date?: string;
  created_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_image_url?: string;
  color?: string;
  size?: string;
  unit_price: number;
  quantity: number;
  total_price: number;
}

export interface Profile {
  id: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
  avatar_url?: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  city: string;
  district: string;
  address_details?: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  is_default: boolean;
}

export interface Review {
  id: string;
  user_id?: string;
  product_id: string;
  order_id?: string;
  rating: number;
  comment?: string;
  is_approved: boolean;
  created_at: string;
  product?: Pick<Product, "id" | "name" | "slug" | "main_image_url">;
  profile?: Pick<Profile, "first_name" | "last_name" | "email">;
}

export interface Payment {
  id: string;
  order_id: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  reference?: string;
  paid_at?: string;
  created_at: string;
  order?: Pick<Order, "id" | "order_number" | "customer_name" | "order_status">;
}

export type DiscountType = "percentage" | "fixed";

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discount_type: DiscountType;
  discount_value: number;
  min_order_amount?: number;
  max_uses?: number;
  used_count: number;
  is_active: boolean;
  expires_at?: string;
  created_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email?: string;
  subject?: string;
  message: string;
  is_read: boolean;
  created_at: string;
}
