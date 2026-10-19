export interface FactoryOrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  title: string;
  size: string;
  color: string;
  quantity: number;
  price?: number;
  unit_price?: number;
  total_price?: number;
  image: string;
  print_file_url: string;
  color_hex: string;
  gallery_images: string[];
  category?: string;
  composition?: string;
  structure?: string;
  fit?: string;
  fit_notes?: string;
  care?: string;
  season?: string;
  collection?: string;
  weight_grams?: number;
}

export interface FactoryOrder {
  id: string;
  order_number: string;
  status: "confirmed" | "processing" | "out_for_delivery" | "delivered";
  created_at: string;
  updated_at: string;
  notes: string | null;
  customer_name: string;
  customer_age?: number | null;
  phone?: string;
  secondary_phone?: string | null;
  governorate: string;
  area: string;
  address?: string;
  location_url?: string | null;
  total_amount?: number;
  subtotal_amount?: number;
  shipping_fee?: number;
  discount_amount?: number;
  coupon_code?: string | null;
  payment_method?: string;
  items: FactoryOrderItem[];
}
