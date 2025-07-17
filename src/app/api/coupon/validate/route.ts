import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/database";
import { Coupon } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json(
        { success: false, error: "Coupon code is required" },
        { status: 400 }
      );
    }

    const coupon = db
      .prepare("SELECT * FROM coupons WHERE code = ? AND used = FALSE")
      .get(code) as Coupon | undefined;

    if (!coupon) {
      return NextResponse.json(
        { success: false, error: "Invalid or already used coupon code" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        code: coupon.code,
        discount_percentage: coupon.discount_percentage,
        valid: true,
      },
    });
  } catch (error) {
    console.error("Error validating coupon:", error);
    return NextResponse.json(
      { success: false, error: "Failed to validate coupon" },
      { status: 500 }
    );
  }
}
