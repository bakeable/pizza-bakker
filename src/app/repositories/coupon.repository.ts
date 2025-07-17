import db from "@/lib/database";
import { Coupon } from "@/types";

export const getCoupon = (couponCode?: string): Coupon | undefined => {
  if (!couponCode) return undefined;

  const coupon = db
    .prepare("SELECT id, code, discount_percentage FROM coupons WHERE code = ?")
    .get(couponCode) as Coupon | undefined;

  if (!coupon) {
    throw new Error("Invalid coupon code");
  }

  return coupon;
};
