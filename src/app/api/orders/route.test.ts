import { runPostHandler } from "@/lib/test-utils";
import { POST } from "./route";
import { OrderRequest, OrderItemRequest } from "@/types";
import db from "@/lib/database";

// Types for database responses
interface DatabaseOrder {
  id: number;
  customer_name: string;
  total_price: number;
  discount: number;
  coupon_code?: string;
  created_at: string;
}

interface DatabaseOrderItem {
  id: number;
  order_id: number;
  name: string;
  description?: string;
  size: string;
  drink_id?: number;
  price: number;
  quantity: number;
  discount: number;
}

describe("Orders API - POST", () => {
  // Setup test data
  const validOrderItem: OrderItemRequest = {
    name: "Test Pizza",
    description: "A delicious test pizza",
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

    test("should correctly apply coupon discount", async () => {
      const orderWithCoupon: OrderRequest = {
        ...validOrderRequest,
        coupon_code: "WELCOME10",
      };

      const res = await runPostHandler(POST, orderWithCoupon);

      expect(res.status).toBe("success");
      expect(res.data.discount).toBeGreaterThan(0);
      expect(res.data.coupon_code).toBe("WELCOME10");
      expect(res.data.total_price).toBeLessThan(res.data.items[0].price);
    });

    test("should handle order without drink", async () => {
      const orderWithoutDrink: OrderRequest = {
        customer_name: "No Drink Customer",
        items: [
          {
            ...validOrderItem,
            drink_id: null,
          },
        ],
      };

      const res = await runPostHandler(POST, orderWithoutDrink);

      expect(res.status).toBe("success");
      expect(res.data.items[0].drink_id).toBeNull();
    });

    test("should calculate pricing correctly with free toppings", async () => {
      const orderWith3Toppings: OrderRequest = {
        customer_name: "Three Toppings Customer",
        items: [
          {
            ...validOrderItem,
            toppings: [1, 2, 3],
            drink_id: null,
          },
        ],
      };

      const res = await runPostHandler(POST, orderWith3Toppings);

      expect(res.status).toBe("success");
      expect(res.data.items[0].price).toBe(12.0);
    });

    test("should charge for toppings beyond the first 3", async () => {
      const orderWith5Toppings: OrderRequest = {
        customer_name: "Many Toppings Customer",
        items: [
          {
            ...validOrderItem,
            toppings: [1, 2, 3, 4, 5],
            drink_id: null,
          },
        ],
      };

      const res = await runPostHandler(POST, orderWith5Toppings);

      expect(res.status).toBe("success");
      expect(res.data.items[0].price).toBeGreaterThan(12.0);
    });
  });

  describe("Validation", () => {
    test("should reject order with invalid pizza size", async () => {
      const invalidSizeRequest: OrderRequest = {
        customer_name: "Invalid Size Customer",
        items: [
          {
            ...validOrderItem,
            size: "extra-large" as "small" | "medium" | "large",
          },
        ],
      };

      const res = await runPostHandler(POST, invalidSizeRequest);

      expect(res.status).toBe("error");
      expect(res.error).toContain("Invalid pizza size");
    });

    test("should reject order with no toppings", async () => {
      const noToppingsRequest: OrderRequest = {
        customer_name: "No Toppings Customer",
        items: [
          {
            ...validOrderItem,
            toppings: [],
          },
        ],
      };

      const res = await runPostHandler(POST, noToppingsRequest);

      expect(res.status).toBe("error");
      expect(res.error).toContain("At least one topping is required");
    });

    test("should reject order with invalid topping IDs", async () => {
      const invalidToppingsRequest: OrderRequest = {
        customer_name: "Invalid Toppings Customer",
        items: [
          {
            ...validOrderItem,
            toppings: [-1, -2, -3],
          },
        ],
      };

      const res = await runPostHandler(POST, invalidToppingsRequest);

      expect(res.status).toBe("error");
      expect(res.error).toContain("Some toppings are invalid or not available");
    });

    test("should reject order with invalid drink ID", async () => {
      const invalidDrinkRequest: OrderRequest = {
        customer_name: "Invalid Drink Customer",
        items: [
          {
            ...validOrderItem,
            drink_id: -1,
          },
        ],
      };

      const res = await runPostHandler(POST, invalidDrinkRequest);

      expect(res.status).toBe("error");
      expect(res.error).toContain("Selected drink is not available");
    });

    test("should reject order with invalid coupon code", async () => {
      const invalidCouponRequest: OrderRequest = {
        ...validOrderRequest,
        coupon_code: "INVALID_COUPON",
      };

      const res = await runPostHandler(POST, invalidCouponRequest);

      expect(res.status).toBe("error");
      expect(res.error).toContain("Invalid coupon code");
    });

    test("should reject order with missing customer name", async () => {
      const noCustomerRequest: OrderRequest = {
        customer_name: "",
        items: [validOrderItem],
      };

      const res = await runPostHandler(POST, noCustomerRequest);

      expect(res.status).toBe("error");
      expect(res.error).toContain("Customer name is required");
    });
  });

  describe("Database", () => {
    test("should persist order to database", async () => {
      const res = await runPostHandler(POST, validOrderRequest);

      expect(res.status).toBe("success");

      const savedOrder = db
        .prepare("SELECT * FROM orders WHERE id = ?")
        .get(res.data.id) as DatabaseOrder;

      expect(savedOrder).toBeTruthy();
      expect(savedOrder.customer_name).toBe("Monique Smit");
      expect(savedOrder.total_price).toBe(res.data.total_price);
    });

    test("should persist order items to database", async () => {
      const multiItemRequest: OrderRequest = {
        customer_name: "Multi Item Customer",
        items: [validOrderItem, { ...validOrderItem, name: "Second Pizza" }],
      };

      const res = await runPostHandler(POST, multiItemRequest);

      expect(res.status).toBe("success");

      const savedItems = db
        .prepare("SELECT * FROM order_items WHERE order_id = ?")
        .all(res.data.id) as DatabaseOrderItem[];

      expect(savedItems).toHaveLength(2);
      expect(savedItems[0].name).toBe("Test Pizza");
      expect(savedItems[1].name).toBe("Second Pizza");
    });
  });
});
