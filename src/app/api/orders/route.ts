import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/database";
import {
  OrderRequest,
  OrderItem,
  Drink,
  Coupon,
  PizzaTopping,
  PizzaPrice,
  Order,
  OrderItemRequest,
} from "@/types";

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

const validateItems = (items: OrderItemRequest[]) => {
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

const priceItems = (items: OrderItemRequest[]) => {
  return items.map(priceItem) as OrderItem[];
};

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

const getCoupon = (couponCode?: string): Coupon | undefined => {
  if (!couponCode) return undefined;

  const coupon = db
    .prepare("SELECT id, code, discount_percentage FROM coupons WHERE code = ?")
    .get(couponCode) as Coupon | undefined;

  if (!coupon) {
    throw new Error("Invalid coupon code");
  }

  return coupon;
};

const applySpecialDiscount = (items: OrderItem[]) => {
  return items;
};

const calculateTotalPrice = (items: OrderItem[], couponDiscount?: number) => {
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

const createOrder = async (
  customerName: string,
  pricedItems: OrderItem[],
  coupon?: Coupon
): Promise<Order> => {
  const {
    items: finalItems,
    total,
    discount,
  } = calculateTotalPrice(pricedItems, coupon?.discount_percentage);

  // Run all DB operations in a transaction for atomicity
  let orderId: number | undefined;
  const items: OrderItem[] = [];

  await db.transaction(() => {
    // Insert order into database
    const insertOrder = db.prepare(`
      INSERT INTO orders (customer_name, total_price, discount, coupon_id)
      VALUES (?, ?, ?, ?)
    `);
    const result = insertOrder.run(
      customerName,
      total,
      discount,
      coupon?.id || null
    );

    // Get the last inserted order ID
    orderId = parseInt(result.lastInsertRowid.toString(), 10);

    // Insert order items
    const insertOrderItem = db.prepare(`
      INSERT INTO order_items (order_id, name, description, size, drink_id, price, quantity, discount)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertTopping = db.prepare(`
      INSERT INTO order_item_toppings (order_item_id, topping_id)
      VALUES (?, ?)
    `);

    for (const item of finalItems) {
      const itemResult = insertOrderItem.run(
        orderId,
        item.name ?? "custom",
        item.description,
        item.size,
        item.drink_id,
        item.price,
        item.quantity,
        item.discount
      );

      const orderItemId = parseInt(itemResult.lastInsertRowid.toString(), 10);

      items.push({
        ...item,
        id: orderItemId,
      });

      for (const toppingId of item.toppings) {
        insertTopping.run(orderItemId, toppingId);
      }
    }
  })();

  if (orderId === undefined) {
    throw new Error("Order ID was not set during transaction.");
  }

  return {
    id: orderId,
    customer_name: customerName,
    items,
    total_price: total,
    discount,
    created_at: new Date().toISOString(),
    coupon_code: coupon?.code,
  };
};

export async function POST(request: NextRequest) {
  try {
    const body: OrderRequest = await request.json();
    const { customer_name, items, coupon_code } = body;

    // Validate pizza toppings
    const validation = validateItems(items);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // Calculate order item prices
    const pricedItems = priceItems(items);
    console.log("Priced items:", pricedItems);

    // Get coupon discount
    const coupon = getCoupon(coupon_code);
    console.log("Coupon:", coupon);

    // Create the order in the database
    const order = await createOrder(customer_name, pricedItems, coupon);
    console.log("Order created:", order);

    return NextResponse.json({
      status: "success",
      data: order,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { status: "error", error: "Failed to create order" },
      { status: 500 }
    );
  }
}
