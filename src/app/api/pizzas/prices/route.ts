import { NextResponse } from "next/server";
import db from "@/lib/database";
import { PizzaPrice } from "@/types";

export async function GET() {
  try {
    const pizzaPrices = db
      .prepare(
        `
        SELECT * FROM pizza_prices ORDER BY price
      `
      )
      .all() as PizzaPrice[];

    return NextResponse.json({
      status: "success",
      data: pizzaPrices,
    });
  } catch (error) {
    console.error("Error fetching pizza presets:", error);
    return NextResponse.json(
      { status: "error", error: "Failed to fetch pizza presets" },
      { status: 500 }
    );
  }
}
