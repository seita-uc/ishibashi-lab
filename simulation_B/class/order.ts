export default class Order {
  id: number;
  stockId: number;
  type: "bid" | "ask";
  price: number;

  constructor(id: number, stockId: number, type: "bid" | "ask", price: number) {
    this.id = id;
    this.stockId = stockId;
    this.type = type;
    this.price = price;
  }
}
