import db from "@/lib/database";
import { OrderItem, Coupon, Order } from "@/types";
import { calculateOrderTotals } from "../services/order.service";

export const createOrder = async (
  customerName: string,
  pricedItems: OrderItem[],
  coupon?: Coupon
): Promise<Order> => {
  const {
    items: finalItems,
    total,
    discount,
  } = calculateOrderTotals(pricedItems, coupon?.discount_percentage);

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
