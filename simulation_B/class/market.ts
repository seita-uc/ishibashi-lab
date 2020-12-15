import { EventEmitter } from "events";
import Order from "./order";
import Stock from "./stock";

// OrderBook classをつくる？

const EventType = {
  OrderCreate: "order.create",
  OrderAgreed: "order.agreed",
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
    // TODO 約定のアルゴリズム書く
    this.event.on(EventType.OrderCreate, (o: Order) => {
      const orders: Order[] = this.orders.get(o.stockId);
      orders.push(o);
      this.orders.set(o.stockId, orders);
      //console.log("order:", o.type);

      for (const stockId of this.orders.keys()) {
        const orders: Order[] = this.orders.get(stockId);
        const bids: Order[] = orders
          .filter((o) => o.type == "bid")
          .sort((a: Order, b: Order) => (a.createdAt > b.createdAt ? 1 : -1));
        const asks = orders
          .filter((o) => o.type == "ask")
          .sort((a: Order, b: Order) => (a.createdAt > b.createdAt ? 1 : -1));

        bids.forEach((bid) => {
          asks.forEach((ask) => {
            if (bid.price == ask.price) {
            }
          });
        });
        //console.log(bids);
        //console.log(asks);
        //for (const order of orders) {
        //// TODO bidとaskをcreatedAtでsortする
        //// TODO priceが一致しているものを約定していく
        //}
      }
    });

    this.event.on(EventType.OrderAgreed, (bid: Order, ask: Order) => {
      const stock: Stock = this.stocks.get(bid.stockId);
      // TODO 任意の数量の株をtransferできるようにする
      stock.transfer(bid.userId, ask.userId, ask.amount);
      stock.setLatestPrice(bid.price);
      this.deleteOrder(bid);
      this.deleteOrder(ask);
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

  agreeOrders(bid: Order, ask: Order) {
    this.event.emit(EventType.OrderAgreed, bid, ask);
  }
}
