export interface OrderItem {
    id: number;
    name: string;
    description?: string;
    price: number;
    quantity: number;
    discount: number;
}

export interface Order {
    id: number;
    customer_name: string;
    items: OrderItem[];
    total_price: number;
    coupon_code?: string;
}

export interface Coupon {
    id: number;
    code: string;
    discount_percentage: number;
}