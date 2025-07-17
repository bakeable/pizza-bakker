import { drinks } from "@/lib/database";
import { GET } from "./route";
import { runHandler } from "@/lib/test-utils";
import { Drink } from "@/types";

describe("Drinks API", () => {
  test("should return drinks", async () => {
    const res = await runHandler(GET);

    expect(res.status).toBe("success");
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data.length).toBeGreaterThan(0);
    expect(res.data[0]).toHaveProperty("id");
    expect(res.data[0]).toHaveProperty("name");
    expect(res.data[0]).toHaveProperty("price");
  });

  test("should contain all default drinks", async () => {
    const res = await runHandler(GET);

    drinks.forEach(([name, price]) => {
      const drink = res.data.find((d: Drink) => d.name === name);
      expect(drink).toBeDefined();
      expect(drink.name).toBe(name);
      expect(drink.price).toBe(price);
    });
  });
});
