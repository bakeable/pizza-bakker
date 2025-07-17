import { presetNames, presetToppings } from "@/lib/database";
import { GET } from "./route";
import { runHandler } from "@/lib/test-utils";
import { PizzaPreset } from "@/types";

describe("PizzaPresets API", () => {
  test("should return pizza presets", async () => {
    const res = await runHandler(GET);

    expect(res.status).toBe("success");
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data.length).toBeGreaterThan(0);
    expect(res.data[0]).toHaveProperty("id");
    expect(res.data[0]).toHaveProperty("name");
    expect(res.data[0]).toHaveProperty("toppings");
    expect(Array.isArray(res.data[0].toppings)).toBe(true);
    expect(res.data[0].toppings.length).toBeGreaterThan(0);
  });

  test("should contain all default presets", async () => {
    const res = await runHandler(GET);

    const presetNamesInResponse = res.data.map(
      (preset: PizzaPreset) => preset.name
    );

    presetNames.forEach((name) => {
      expect(presetNamesInResponse).toContain(name);
    });
  });

  test("should return correct amount of toppings per preset", async () => {
    const res = await runHandler(GET);

    res.data.forEach((preset: PizzaPreset) => {
      expect(preset.toppings).toBeDefined();
      expect(Array.isArray(preset.toppings)).toBe(true);
      expect(preset.toppings.length).toBeGreaterThan(0);

      const toppings = presetToppings[preset.name];
      expect(toppings).toBeDefined();
      expect(Array.isArray(toppings)).toBe(true);
      expect(preset.toppings.length).toBe(toppings.length);
    });
  });
});
