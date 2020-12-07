export default class Order {
  id: number;
  type: "bid" | "ask";
  price: number;

  constructor(id: number, type: "bid" | "ask", price: number) {
    this.id = id;
    this.type = type;
    this.price = price;
  }
}
