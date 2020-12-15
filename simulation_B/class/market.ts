import { EventEmitter } from "events";
import Order from "./order";
import Stock from "./stock";

// OrderBook classをつくる？

const EventType = {
  OrderCreate: "order.create",
  OrderComplete: "order.complete",
  OrderCancel: "order.cancel",
};

export default class Market {
  orders: Map<number, Order[]> = new Map<number, Order[]>();
  stocks: Map<number, Stock> = new Map<number, Stock>();
  event: EventEmitter;

  constructor(stocks: Stock[]) {
    for (const s of stocks) {
      this.stocks.set(s.id, s);
      this.orders.set(s.id, []);
    }
    this.event = new EventEmitter();
  }

  // 非同期で板を動かす
  async start() {
    // 板を参照して約定できる取引がないか確認する
    this.event.on(EventType.OrderCreate, (o: Order) => {
      const orders: Order[] = this.orders.get(o.stockId);
      orders.push(o);
      this.orders.set(o.stockId, orders);
      console.log("order:", o.type);
    });

    this.event.on(EventType.OrderComplete, (o: Order) => {
      const stock: Stock = this.stocks.get(o.stockId);
      stock.setLatestPrice(o.price);
      this.deleteOrder(o);
    });

    this.event.on(EventType.OrderCancel, (o: Order) => {
      this.deleteOrder(o);
    });
  }

  setOrder(order: Order) {
    this.event.emit(EventType.OrderCreate, order);
  }

  deleteOrder(order: Order) {
    const orders = this.orders
      .get(order.stockId)
      .filter((o: Order) => o.orderId != order.orderId);
    this.orders.set(order.stockId, orders);
  }

  cancelOrder(order: Order) {
    this.event.emit(EventType.OrderCancel, order);
  }

  completeOrder(order: Order) {
    this.event.emit(EventType.OrderComplete, order);
  }
}
