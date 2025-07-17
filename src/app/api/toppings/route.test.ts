import { runHandler } from "@/lib/test-utils";
import { GET } from "./route";
import { toppings } from "@/lib/database";
import { PizzaTopping } from "@/types";

describe("Toppings API", () => {
  test("should return toppings", async () => {
    const res = await runHandler(GET);

    expect(res.status).toBe("success");
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data.length).toBeGreaterThan(0);
    expect(res.data[0]).toHaveProperty("id");
    expect(res.data[0]).toHaveProperty("name");
    expect(res.data[0]).toHaveProperty("price");
  });

  test("should contain default toppings", async () => {
    const res = await runHandler(GET);

    const toppingNames = res.data.map((topping: PizzaTopping) => topping.name);
    toppings.forEach(([name]) => {
      expect(toppingNames).toContain(name);
    });
  });
});
