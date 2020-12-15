import { uid } from "uid";

export default class Order {
  orderId: string;
  stockId: number;
  userId: number;
  type: "bid" | "ask";
  price: number;

  constructor(
    stockId: number,
    userId: number,
    type: "bid" | "ask",
    price: number
  ) {
    this.orderId = uid();
    this.stockId = stockId;
    this.userId = userId;
    this.type = type;
    this.price = price;
  }
}
