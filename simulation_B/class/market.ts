import Order from "./order";

export default class Market {
  orders: Order[];
  values: Map<number, number> = new Map<number, number>();

  constructor() {}

  setOrder(order: Order) {
    this.orders.push(order);
  }
}
