import db from "@/lib/database";
import {
  Drink,
  OrderItem,
  OrderItemRequest,
  PizzaPrice,
  PizzaTopping,
} from "@/types";

//////////////////////////////////////////////////////////////////////
///////////////////////// Order Validation ///////////////////////////
//////////////////////////////////////////////////////////////////////
const validatePizzaToppings = (toppingIds: number[]): string | null => {
  const validToppings = db
    .prepare(
      `
      SELECT * FROM toppings WHERE id IN (${toppingIds.map(() => "?").join(",")})
    `
    )
    .all(...toppingIds);
  if (validToppings.length !== toppingIds.length) {
    return "Some toppings are invalid or not available";
  }
  return null;
};

const validateDrink = (drinkId: number | null): string | null => {
  if (drinkId === null) return null; // No drink selected
  const drink = db.prepare("SELECT * FROM drinks WHERE id = ?").get(drinkId) as
    | Drink
    | undefined;
  if (!drink) {
    return "Selected drink is not available";
  }
  return null;
};

export const validateItems = (items: OrderItemRequest[]) => {
  const errors: string[] = [];
  for (const item of items) {
    if (!item.size) {
      errors.push("Pizza size is required");
    }
    if (["small", "medium", "large"].indexOf(item.size) === -1) {
      errors.push("Invalid pizza size");
    }
    if (!item.toppings || item.toppings.length === 0) {
      errors.push("At least one topping is required");
    }
    const toppingError = validatePizzaToppings(item.toppings);
    if (toppingError) {
      errors.push(toppingError);
    }
    const drinkError = validateDrink(item.drink_id);
    if (drinkError) {
      errors.push(drinkError);
    }
  }

  return {
    valid: errors.length === 0,
    error: errors.join("\n"),
  };
};

//////////////////////////////////////////////////////////////////////
///////////////////// OrderItem Price Calculation ////////////////////
//////////////////////////////////////////////////////////////////////
const priceItem = (item: OrderItemRequest) => {
  // Get base price
  const pizzaPrice = db
    .prepare("SELECT price FROM pizza_prices WHERE size = ?")
    .get(item.size) as PizzaPrice;
  if (!pizzaPrice) {
    throw new Error(`No price found for pizza size: ${item.size}`);
  }
  const basePrice = pizzaPrice.price;

  // Get prices for toppings
  const toppingsPrices = item.toppings.map((toppingId) => {
    const topping = db
      .prepare("SELECT price FROM toppings WHERE id = ?")
      .get(toppingId) as PizzaTopping | undefined;
    return topping ? topping.price : 0;
  });

  // Cheapest 3 toppings are free, other toppings are charged
  const toppingsPrice = toppingsPrices
    .sort((a, b) => a - b)
    .slice(3)
    .reduce((total, price) => total + price, 0);

  // Get drink price if selected
  const drink = item.drink_id
    ? (db
        .prepare("SELECT price FROM drinks WHERE id = ?")
        .get(item.drink_id) as Drink)
    : null;
  const drinkPrice = drink ? drink.price : 0;

  return {
    ...item,
    price: basePrice + toppingsPrice + drinkPrice,
  };
};

export const priceItems = (items: OrderItemRequest[]) => {
  return items.map(priceItem) as OrderItem[];
};

//////////////////////////////////////////////////////////////////////
///////////////////// Order Totals Calculation ///////////////////////
//////////////////////////////////////////////////////////////////////
const applySpecialDiscount = (items: OrderItem[]) => {
  return items;
};

export const calculateOrderTotals = (
  items: OrderItem[],
  couponDiscount?: number
) => {
  // Add weather discount logic here if needed
  const discountedItems = applySpecialDiscount(items);

  // Get the total sum
  const total = discountedItems.reduce(
    (sum: number, item: OrderItem) => sum + item.price * item.quantity,
    0
  );

  // Apply coupon discount
  const discountAmount = couponDiscount ? total * (couponDiscount / 100) : 0;

  return {
    items: discountedItems,
    subtotal: total,
    discount: discountAmount,
    total: total - discountAmount,
  };
};
