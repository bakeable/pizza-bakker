import { runPostHandler } from "@/lib/test-utils";
import { POST } from "./route";
import { OrderRequest, OrderItemRequest } from "@/types";
import db from "@/lib/database";

describe("Orders API - POST", () => {
  // Setup test data
  const validOrderItem: OrderItemRequest = {
    name: "Test Pizza",
    description: "Description",
    size: "medium",
    toppings: [1, 2, 3],
    drink_id: 1,
    quantity: 1,
  };

  const validOrderRequest: OrderRequest = {
    customer_name: "Monique Smit",
    items: [validOrderItem],
  };

  beforeEach(() => {
    // Clean up test data before each test
    db.prepare("DELETE FROM order_item_toppings WHERE 1=1").run();
    db.prepare("DELETE FROM order_items WHERE 1=1").run();
    db.prepare("DELETE FROM orders WHERE 1=1").run();
  });

  describe("Order creation", () => {
    test("should create order with valid data", async () => {
      const res = await runPostHandler(POST, validOrderRequest);

      expect(res.status).toBe("success");
      expect(res.data).toHaveProperty("id");
      expect(res.data.customer_name).toBe("Monique Smit");
      expect(res.data.items).toHaveLength(1);
      expect(res.data.total_price).toBeGreaterThan(0);
      expect(res.data.discount).toBe(0);
      expect(res.data).toHaveProperty("created_at");
    });

    test("should create order with multiple items", async () => {
      const multiItemRequest: OrderRequest = {
        customer_name: "Jan Smit",
        items: [
          {
            ...validOrderItem,
            name: "Margherita",
            size: "small",
            quantity: 2,
          },
          {
            ...validOrderItem,
            name: "Pepperoni",
            size: "large",
            toppings: [1, 2, 3, 4, 5],
            quantity: 1,
          },
        ],
      };

      const res = await runPostHandler(POST, multiItemRequest);

      expect(res.status).toBe("success");
      expect(res.data.items).toHaveLength(2);
      expect(res.data.customer_name).toBe("Jan Smit");
      expect(res.data.total_price).toBeGreaterThan(0);
    });
  });
});
