import { OrderItem } from "./ecommerce";

export type PizzaSize = "small" | "medium" | "large";

export interface PizzaPrice {
  id: number;
  size: PizzaSize;
  price: number;
}

export interface PizzaTopping {
  id: number;
  name: string;
  price: number;
}

export interface PizzaPreset {
  id: number;
  name: string;
  toppings: number[];
}

export interface Drink {
  id: number;
  name: string;
  price: number;
}

export interface Pizza extends OrderItem {
  size: PizzaSize;
  toppings: number[];
  drinks: Drink;
}
