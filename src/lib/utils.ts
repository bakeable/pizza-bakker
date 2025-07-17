import { PizzaSize, PizzaTopping } from "@/types";

// Pizza base prices based on size
export const PIZZA_BASE_PRICES: Record<PizzaSize, number> = {
  small: 8.0,
  medium: 12.0,
  large: 16.0,
};

// Format price to currency
export const formatPrice = (price: number): string => {
  return `€${price.toFixed(2)}`;
};

// Validate pizza toppings (minimum 1, maximum 6)
export const validatePizzaToppings = (toppingIds: number[]) => {
  if (toppingIds.length === 0) {
    return { valid: false, error: "Minimaal 1 topping is verplicht" };
  }
  if (toppingIds.length > 6) {
    return { valid: false, error: "Maximaal 6 toppings toegestaan" };
  }
  return { valid: true, error: null };
};

// Calculate order total with pricing logic
export interface OrderCalculation {
  pizza_base_price: number;
  free_toppings: PizzaTopping[];
  paid_toppings: PizzaTopping[];
  drink_price: number;
  subtotal: number;
  coupon_discount: number;
  total: number;
}

export const calculateOrderTotal = (
  size: PizzaSize,
  selectedToppings: PizzaTopping[],
  drinkPrice: number = 0,
  couponDiscountPercentage: number = 0
): OrderCalculation => {
  const basePizzaPrice = PIZZA_BASE_PRICES[size];

  // Sort toppings by price (cheapest first)
  const sortedToppings = [...selectedToppings].sort(
    (a, b) => a.price - b.price
  );

  // First 3 toppings are free, rest are paid
  const freeToppings = sortedToppings.slice(0, 3);
  const paidToppings = sortedToppings.slice(3);

  const paidToppingsPrice = paidToppings.reduce(
    (sum, topping) => sum + topping.price,
    0
  );

  const subtotal = basePizzaPrice + paidToppingsPrice + drinkPrice;
  const couponDiscount = subtotal * (couponDiscountPercentage / 100);
  const total = subtotal - couponDiscount;

  return {
    pizza_base_price: basePizzaPrice,
    free_toppings: freeToppings,
    paid_toppings: paidToppings,
    drink_price: drinkPrice,
    subtotal,
    coupon_discount: couponDiscount,
    total,
  };
};
