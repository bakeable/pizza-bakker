import { NextRequest, NextResponse } from "next/server";
import { OrderRequest } from "@/types";
import { getCoupon } from "@/app/repositories/coupon.repository";
import { createOrder } from "@/app/repositories/order.repository";
import { validateItems, priceItems } from "@/app/services/order.service";

export async function POST(request: NextRequest) {
  try {
    const body: OrderRequest = await request.json();
    const { customer_name, items, coupon_code } = body;

    // Validate customer name
    if (!customer_name || customer_name.trim() === "") {
      return NextResponse.json(
        { status: "error", error: "Customer name is required" },
        { status: 400 }
      );
    }

    // Validate pizza toppings
    const validation = validateItems(items);
    console.log("Validation result:", validation);
    if (!validation.valid) {
      return NextResponse.json(
        { status: "error", error: validation.error },
        { status: 400 }
      );
    }

    // Calculate order item prices
    const pricedItems = priceItems(items);
    console.log("Priced items:", pricedItems);

    // Get coupon discount
    const coupon = getCoupon(coupon_code);
    console.log("Coupon:", coupon);

    // Create the order in the database
    const order = await createOrder(customer_name, pricedItems, coupon);
    console.log("Order created:", order);

    return NextResponse.json({
      status: "success",
      data: order,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { status: "error", error: `Failed to create order: ${error}` },
      { status: 500 }
    );
  }
}
