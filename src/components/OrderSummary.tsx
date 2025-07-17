import { Drink, PizzaSize, OrderOverview } from "@/types";
import { formatPrice } from "@/lib/utils";
import { ShoppingCart } from "lucide-react";

interface OrderSummaryProps {
  orderOverview: OrderOverview | null;
  selectedSize: PizzaSize;
  selectedDrink: Drink | null;
  onPlaceOrder: () => void;
  loading: boolean;
}

export default function OrderSummary({
  orderOverview,
  selectedSize,
  selectedDrink,
  onPlaceOrder,
  loading,
}: OrderSummaryProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 h-fit sticky top-6">
      <h2 className="text-2xl font-semibold mb-4">Bestelling overzicht</h2>

      {orderOverview ? (
        <div className="space-y-3">
          <div className="flex justify-between">
            <span>Pizza ({selectedSize})</span>
            <span>{formatPrice(orderOverview.pizza_base_price)}</span>
          </div>

          {orderOverview.free_toppings.length > 0 && (
            <div className="text-sm text-green-600">
              <div className="font-medium">Gratis:</div>
              {orderOverview.free_toppings.map((t) => (
                <div key={t.id} className="ml-2">
                  • {t.name}
                </div>
              ))}
            </div>
          )}

          {orderOverview.paid_toppings.length > 0 && (
            <div>
              <div className="font-medium text-sm">Extra toppings:</div>
              {orderOverview.paid_toppings.map((t) => (
                <div key={t.id} className="flex justify-between text-sm ml-2">
                  <span>• {t.name}</span>
                  <span>{formatPrice(t.price)}</span>
                </div>
              ))}
            </div>
          )}

          {selectedDrink && (
            <div className="flex justify-between">
              <span>{selectedDrink.name}</span>
              <span>{formatPrice(selectedDrink.price)}</span>
            </div>
          )}

          <hr className="my-3" />

          <div className="flex justify-between">
            <span>Subtotaal</span>
            <span>{formatPrice(orderOverview.subtotal)}</span>
          </div>

          {orderOverview.coupon_discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Kortings</span>
              <span>-{formatPrice(orderOverview.coupon_discount)}</span>
            </div>
          )}

          <hr className="my-3" />

          <div className="flex justify-between text-xl font-bold">
            <span>Totaal</span>
            <span>{formatPrice(orderOverview.total)}</span>
          </div>
        </div>
      ) : (
        <p className="text-gray-500">Selecteer toppings om de prijs te zien</p>
      )}

      <button
        onClick={onPlaceOrder}
        disabled={loading || !orderOverview}
        className="w-full mt-6 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          "Bestelling plaatsen..."
        ) : (
          <>
            <ShoppingCart className="w-5 h-5" />
            Bestelling plaatsen
          </>
        )}
      </button>
    </div>
  );
}
