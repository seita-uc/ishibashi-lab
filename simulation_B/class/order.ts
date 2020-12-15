import { uid } from "uid";

export default class Order {
  orderId: string;
  stockId: number;
  userId: number;
  type: "bid" | "ask";
  price: number;
  amount: number;
  createdAt: number;

  constructor(
    stockId: number,
    userId: number,
    type: "bid" | "ask",
    price: number,
    amount: number
  ) {
    this.orderId = uid();
    this.stockId = stockId;
    this.userId = userId;
    this.type = type;
    this.price = price;
    this.amount = amount;
    this.createdAt = Date.now();
  }
}
