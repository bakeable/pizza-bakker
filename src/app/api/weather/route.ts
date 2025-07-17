import { NextResponse } from "next/server";
import { getCurrentWeather } from "@/lib/weather";

export async function GET() {
  try {
    const currentWeather = await getCurrentWeather();

    return NextResponse.json({
      status: "success",
      data: currentWeather,
    });
  } catch (error) {
    console.error("Error fetching current weather:", error);
    return NextResponse.json(
      { status: "error", error: "Failed to fetch current weather" },
      { status: 500 }
    );
  }
}
