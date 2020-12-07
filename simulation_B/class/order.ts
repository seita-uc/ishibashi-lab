export default class Order {
  stockId: number;
  type: "bid" | "ask";
  price: number;

  constructor(stockId: number, type: "bid" | "ask", price: number) {
    this.stockId = stockId;
    this.type = type;
    this.price = price;
  }
}
