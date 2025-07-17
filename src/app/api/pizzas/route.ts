import { NextResponse } from "next/server";
import db from "@/lib/database";
import { PizzaPreset } from "@/types";

interface PizzaPresetDTO {
  id: number;
  name: string;
  topping_ids: string;
}

export async function GET() {
  try {
    const pizzas = db
      .prepare(
        `
        SELECT 
          pp.id,
          pp.name,
          GROUP_CONCAT(ppt.topping_id) AS topping_ids
        FROM pizza_presets pp
        JOIN pizza_preset_toppings ppt ON pp.id = ppt.preset_id
        GROUP BY pp.id
        ORDER BY pp.name
      `
      )
      .all() as PizzaPresetDTO[];

    // Map to PizzaPreset[]
    const formattedPizzas: PizzaPreset[] = pizzas.map(
      (pizza: PizzaPresetDTO) => ({
        id: pizza.id,
        name: pizza.name,
        toppings: pizza.topping_ids
          ? pizza.topping_ids.split(",").map((id: string) => parseInt(id, 10))
          : [],
      })
    );

    return NextResponse.json({
      status: "success",
      data: formattedPizzas,
    });
  } catch (error) {
    console.error("Error fetching pizza presets:", error);
    return NextResponse.json(
      { status: "error", error: "Failed to fetch pizza presets" },
      { status: 500 }
    );
  }
}
