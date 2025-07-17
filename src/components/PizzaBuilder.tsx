import { useState, useEffect, useCallback } from "react";
import {
  PizzaTopping,
  Drink,
  PizzaSize,
  PizzaPreset,
  OrderRequest,
  WeatherData,
} from "@/types";
import PreConfiguredPizzas from "./PizzaPresets";
import SizeSelection from "./SizeSelection";
import ToppingSelection from "./ToppingSelection";
import DrinkSelection from "./DrinkSelection";
import CouponInput from "./CouponInput";
import OrderSummary from "./OrderSummary";
import Weather from "./Weather";

interface PizzaBuilderProps {
  onOrderPlaced: (orderId: number) => void;
}

export default function PizzaBuilder({ onOrderPlaced }: PizzaBuilderProps) {
  const [toppings, setToppings] = useState<PizzaTopping[]>([]);
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [pizzaPresets, setPizzaPresets] = useState<PizzaPreset[]>([]);
  const [selectedSize, setSelectedSize] = useState<PizzaSize>("medium");
  const [selectedToppings, setSelectedToppings] = useState<PizzaTopping[]>([]);
  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderOverview, setOrderOverview] = useState<{
    customer_name: string;
    items: { type: string; base_price?: number; price?: number }[];
    total_price: number;
    discount: number;
    coupon_code?: string;
  } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [toppingsRes, drinksRes, pizzasRes, weatherRes] = await Promise.all(
        [
          fetch("/api/toppings"),
          fetch("/api/drinks"),
          fetch("/api/pizzas"),
          fetch("/api/weather"),
        ]
      );

      const [toppingsData, drinksData, pizzasData, weatherData] =
        await Promise.all([
          toppingsRes.json(),
          drinksRes.json(),
          pizzasRes.json(),
          weatherRes.json(),
        ]);

      console.log(weatherData);
      if (toppingsData.status === "success") setToppings(toppingsData.data);
      if (drinksData.status === "success") setDrinks(drinksData.data);
      if (pizzasData.status === "success") setPizzaPresets(pizzasData.data);
      if (weatherData.status === "success") setWeather(weatherData.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Kon pizzagegevens niet laden");
    }
  };

  const calculatePrice = useCallback(async () => {
    if (selectedToppings.length === 0) {
      setOrderOverview(null);
      return;
    }

    try {
      const orderRequest: OrderRequest = {
        customer_name: "test",
        items: [
          {
            name: "Aangepaste Pizza",
            description: `${selectedSize} pizza met ${selectedToppings.map((t) => t.name).join(", ")}`,
            size: selectedSize,
            toppings: selectedToppings.map((t) => t.id),
            drink_id: selectedDrink?.id || null,
            quantity: 1,
          },
        ],
        coupon_code: couponCode || undefined,
      };

      const response = await fetch(
        `/api/orders?orderData=${encodeURIComponent(JSON.stringify(orderRequest))}`
      );
      const data = await response.json();

      if (data.status === "success") {
        setOrderOverview(data.data);
        setError(null);
      } else {
        setOrderOverview(null);
        setError(data.error);
      }
    } catch (error) {
      console.error("Error calculating price:", error);
      setOrderOverview(null);
      setError("Kon prijs niet berekenen");
    }
  }, [selectedSize, selectedToppings, selectedDrink, couponCode]);

  useEffect(() => {
    calculatePrice();
  }, [calculatePrice]);

  const toggleTopping = (topping: PizzaTopping) => {
    const isSelected = selectedToppings.find((t) => t.id === topping.id);

    if (isSelected) {
      setSelectedToppings(selectedToppings.filter((t) => t.id !== topping.id));
    } else {
      if (selectedToppings.length < 6) {
        setSelectedToppings([...selectedToppings, topping]);
      }
    }
  };

  const selectPreconfiguredPizza = (preset: PizzaPreset) => {
    const presetToppings = toppings.filter((t) =>
      preset.toppings.includes(t.id)
    );
    setSelectedToppings(presetToppings);
  };

  const placeOrder = async () => {
    setLoading(true);
    setError(null);

    try {
      const orderRequest: OrderRequest = {
        customer_name: "test",
        items: [
          {
            name: "Aangepaste Pizza",
            description: `${selectedSize} pizza met ${selectedToppings.map((t) => t.name).join(", ")}`,
            size: selectedSize,
            toppings: selectedToppings.map((t) => t.id),
            drink_id: selectedDrink?.id || null,
            quantity: 1,
          },
        ],
        coupon_code: couponCode || undefined,
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderRequest),
      });

      const data = await response.json();

      if (data.status === "success") {
        onOrderPlaced(data.data.id);
      } else {
        setError(data.error || "Kon bestelling niet plaatsen");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      setError("Kon bestelling niet plaatsen");
    } finally {
      setLoading(false);
    }
  };

  // Convert backend response to OrderOverview format for OrderSummary
  const convertToOrderSummaryFormat = () => {
    if (!orderOverview) return null;

    // Extract pizza and drink items from backend response
    const pizzaItem = orderOverview.items?.find(
      (item: { type: string }) => item.type === "pizza"
    );
    const drinkItem = orderOverview.items?.find(
      (item: { type: string }) => item.type === "drink"
    );

    // Get selected toppings data (selectedToppings is already PizzaTopping[])
    const toppings = selectedToppings.sort((a, b) =>
      a.price > b.price ? 1 : -1
    );

    return {
      pizza_base_price: pizzaItem?.base_price || 0,
      free_toppings: toppings.slice(0, 3), // Cheapest 3 are free
      paid_toppings: toppings.slice(3),
      drink_price: drinkItem?.price || 0,
      subtotal: orderOverview.total_price + orderOverview.discount,
      coupon_discount: orderOverview.discount,
      total: orderOverview.total_price,
    };
  };

  const orderSummaryData = convertToOrderSummaryFormat();

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Bouw je pizza</h1>
        <p className="text-gray-600">Kies uit meerdere toppings</p>
        <Weather weather={weather} />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <PreConfiguredPizzas
        pizzaPresets={pizzaPresets}
        onSelectPreset={selectPreconfiguredPizza}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <SizeSelection
            selectedSize={selectedSize}
            onSelectSize={setSelectedSize}
          />

          <ToppingSelection
            toppings={toppings}
            selectedToppings={selectedToppings}
            onToggleTopping={toggleTopping}
          />

          <DrinkSelection
            drinks={drinks}
            selectedDrink={selectedDrink}
            onSelectDrink={setSelectedDrink}
          />

          <CouponInput
            couponCode={couponCode}
            couponDiscount={orderOverview?.discount || 0}
            applyCoupon={setCouponCode}
          />
        </div>

        <OrderSummary
          orderOverview={orderSummaryData}
          selectedSize={selectedSize}
          selectedDrink={selectedDrink}
          onPlaceOrder={placeOrder}
          loading={loading}
        />
      </div>
    </div>
  );
}
