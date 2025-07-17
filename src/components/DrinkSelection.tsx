import { Drink } from "@/types";
import { formatPrice } from "@/lib/utils";

interface DrinkSelectionProps {
  drinks: Drink[];
  selectedDrink: Drink | null;
  onSelectDrink: (drink: Drink | null) => void;
}

export default function DrinkSelection({
  drinks,
  selectedDrink,
  onSelectDrink,
}: DrinkSelectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-4">Kies drankje (optioneel)</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <button
          onClick={() => onSelectDrink(null)}
          className={`p-3 rounded-lg border-2 transition-colors ${
            !selectedDrink
              ? "border-blue-500 bg-blue-50 text-blue-700"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          Geen drankje
        </button>
        {drinks.map((drink) => (
          <button
            key={drink.id}
            onClick={() => onSelectDrink(drink)}
            className={`flex items-center justify-between p-3 rounded-lg border-2 transition-colors ${
              selectedDrink?.id === drink.id
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div>
              <div className="font-medium">{drink.name}</div>
            </div>
            <span className="font-semibold">{formatPrice(drink.price)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
