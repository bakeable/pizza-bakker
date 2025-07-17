import { NextResponse } from "next/server";
import db from "@/lib/database";
import { Drink } from "@/types";

export async function GET() {
  try {
    const drinks = db
      .prepare("SELECT * FROM drinks ORDER BY name")
      .all() as Drink[];

    return NextResponse.json({
      status: "success",
      data: drinks,
    });
  } catch (error) {
    console.error("Error fetching drinks:", error);
    return NextResponse.json(
      { status: "error", error: "Failed to fetch drinks" },
      { status: 500 }
    );
  }
}
