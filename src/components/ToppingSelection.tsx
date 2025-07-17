import { PizzaTopping } from "@/types";
import { formatPrice } from "@/lib/utils";
import { Check, Plus } from "lucide-react";

interface ToppingSelectionProps {
  toppings: PizzaTopping[];
  selectedToppings: PizzaTopping[];
  onToggleTopping: (topping: PizzaTopping) => void;
  validationError?: string | null;
}

export default function ToppingSelection({
  toppings,
  selectedToppings,
  onToggleTopping,
  validationError,
}: ToppingSelectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-4">
        Kies toppings ({selectedToppings.length}/6)
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        Eerste 3 goedkoopste toppings zijn gratis! Minimaal 1, maximaal 6
        toppings.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {toppings.map((topping) => {
          const isSelected = selectedToppings.find((t) => t.id === topping.id);
          const canAdd = selectedToppings.length < 6;

          return (
            <button
              key={topping.id}
              onClick={() => onToggleTopping(topping)}
              disabled={!isSelected && !canAdd}
              className={`flex items-center justify-between p-3 rounded-lg border-2 transition-colors ${
                isSelected
                  ? "border-green-500 bg-green-50 text-green-700"
                  : canAdd
                    ? "border-gray-200 hover:border-gray-300"
                    : "border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed"
              }`}
            >
              <div className="flex items-center gap-2">
                {isSelected ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Plus className="w-5 h-5" />
                )}
                <span className="font-medium">{topping.name}</span>
              </div>
              <span className="font-semibold">
                {formatPrice(topping.price)}
              </span>
            </button>
          );
        })}
      </div>

      {validationError && (
        <p className="text-red-600 text-sm mt-2">{validationError}</p>
      )}
    </div>
  );
}
