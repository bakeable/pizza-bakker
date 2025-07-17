import { NextResponse } from "next/server";
import db from "@/lib/database";
import { PizzaTopping } from "@/types";

export async function GET() {
  try {
    const toppings = db
      .prepare("SELECT * FROM toppings ORDER BY name")
      .all() as PizzaTopping[];

    return NextResponse.json({
      status: "success",
      data: toppings,
    });
  } catch (error) {
    console.error("Error fetching toppings:", error);
    return NextResponse.json(
      { status: "error", error: "Failed to fetch toppings" },
      { status: 500 }
    );
  }
}
