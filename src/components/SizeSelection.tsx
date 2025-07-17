import { useState, useEffect } from "react";
import { PizzaSize, PizzaPrice } from "@/types";
import { formatPrice } from "@/lib/utils";

interface SizeSelectionProps {
  selectedSize: PizzaSize;
  onSelectSize: (size: PizzaSize) => void;
}

export default function SizeSelection({
  selectedSize,
  onSelectSize,
}: SizeSelectionProps) {
  const [pizzaPrices, setPizzaPrices] = useState<PizzaPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPizzaPrices = async () => {
      try {
        const response = await fetch("/api/pizzas/prices");
        const data = await response.json();

        if (data.status === "success") {
          setPizzaPrices(data.data);
          setError(null);
        } else {
          setError("Kon pizza prijzen niet laden");
        }
      } catch (error) {
        console.error("Error fetching pizza prices:", error);
        setError("Kon pizza prijzen niet laden");
      } finally {
        setLoading(false);
      }
    };

    fetchPizzaPrices();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Kies formaat</h2>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-4 rounded-lg border-2 border-gray-200 animate-pulse"
            >
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Kies formaat</h2>
        <div className="text-red-600 text-center py-4">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-4">Kies formaat</h2>
      <div className="grid grid-cols-3 gap-4">
        {pizzaPrices.map((pizzaPrice) => (
          <button
            key={pizzaPrice.id}
            onClick={() => onSelectSize(pizzaPrice.size)}
            className={`p-4 rounded-lg border-2 transition-colors ${
              selectedSize === pizzaPrice.size
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="font-semibold capitalize">{pizzaPrice.size}</div>
            <div className="text-sm text-gray-600">
              {formatPrice(pizzaPrice.price)}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
