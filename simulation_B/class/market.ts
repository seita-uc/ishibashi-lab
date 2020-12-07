import Order from "./order";
import Stock from "./stock";

export default class Market {
  orders: Order[] = [];
  stocks: Map<number, Stock> = new Map<number, Stock>();

  constructor(stocks: Stock[]) {
    for (const s of stocks) {
      this.stocks.set(s.id, s);
    }
  }

  setOrder(order: Order) {
    this.orders.push(order);
  }
}
