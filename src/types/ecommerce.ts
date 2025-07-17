import { PizzaSize } from "./food";

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
}

export interface OrderItemRequest {
  name: string;
  description?: string;
  size: PizzaSize;
  toppings: number[];
  drink_id: number | null;
  quantity: number;
}

export interface OrderItem extends OrderItemRequest {
  id: number;
  price: number;
  discount: number;
}

export interface OrderRequest {
  customer_name: string;
  items: OrderItemRequest[];
  coupon_code?: string;
}

export interface Order {
  id: number;
  customer_name: string;
  items: OrderItem[];
  total_price: number;
  discount: number;
  created_at: string;
  coupon_code?: string;
}

export interface Coupon {
  id: number;
  code: string;
  discount_percentage: number;
}
