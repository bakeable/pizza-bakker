import { NextRequest, NextResponse } from "next/server";
import { OrderRequest } from "@/types";
import { getCoupon } from "@/app/repositories/coupon.repository";
import { createOrder } from "@/app/repositories/order.repository";
import {
  validateItems,
  priceItems,
  calculateOrderTotals,
} from "@/app/services/order.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderDataParam = searchParams.get("orderData");

    if (!orderDataParam) {
      return NextResponse.json(
        { status: "error", error: "Order data is required" },
        { status: 400 }
      );
    }

    let orderData: OrderRequest;
    try {
      orderData = JSON.parse(decodeURIComponent(orderDataParam));
    } catch {
      return NextResponse.json(
        { status: "error", error: "Invalid order data format" },
        { status: 400 }
      );
    }

    const { customer_name, items, coupon_code } = orderData;

    // Validate customer name
    if (!customer_name || customer_name.trim() === "") {
      return NextResponse.json(
        { status: "error", error: "Customer name is required" },
        { status: 400 }
      );
    }

    // Validate pizza toppings
    const validation = validateItems(items);
    if (!validation.valid) {
      return NextResponse.json(
        { status: "error", error: validation.error },
        { status: 400 }
      );
    }

    // Calculate order item prices
    const pricedItems = priceItems(items);

    // Get coupon
    const coupon = getCoupon(coupon_code);

    // Get totals
    const {
      items: finalItems,
      total,
      discount,
    } = await calculateOrderTotals(pricedItems, coupon?.discount_percentage);

    return NextResponse.json({
      status: "success",
      data: {
        customer_name,
        items: finalItems,
        total_price: total,
        discount,
        coupon_code: coupon?.code,
      },
    });
  } catch (error: unknown) {
    console.error("Error calculating order:", error);
    return NextResponse.json(
      { status: "error", error: "Failed to calculate order" },
      { status: 500 }
    );
  }
}

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error creating order:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
      error,
    });
    return NextResponse.json(
      { status: "error", error: `Failed to create order: ${error}` },
      { status: 500 }
    );
  }
}
