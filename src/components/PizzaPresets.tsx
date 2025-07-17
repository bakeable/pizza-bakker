import { PizzaPreset } from "@/types";

interface PizzaPresetsProps {
  pizzaPresets: PizzaPreset[];
  onSelectPreset: (preset: PizzaPreset) => void;
}

export default function PizzaPresets({
  pizzaPresets,
  onSelectPreset,
}: PizzaPresetsProps) {
  if (pizzaPresets.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-4">Pizza Presets</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pizzaPresets.map((preset) => (
          <div
            key={preset.id}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onSelectPreset(preset)}
          >
            <h3 className="font-semibold text-lg">{preset.name}</h3>
            <p className="text-xs text-gray-500 mt-1">
              Toppings: {preset.toppings.length}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
