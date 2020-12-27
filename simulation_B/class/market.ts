import { EventEmitter } from "events";
import { InsufficientBalanceError, NoBalanceError } from "./error";
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

  findDuplicatedOrderIndex(order: Order, orders: Order[]): number {
    const index: number = orders.findIndex(
      (o) =>
        o.stockId == order.stockId &&
        o.userId == order.userId &&
        o.amount == order.amount &&
        o.type == order.type &&
        o.createdAt <= order.createdAt
    );
    return index;
  }

  // 非同期で板を動かす
  async start() {
    // 板を参照して約定できる取引がないか確認する
    this.event.on(EventType.OrderCreate, this.onOrderCreated);
    this.event.on(EventType.OrderAgreed, this.onOrderAgreed);
    this.event.on(EventType.OrderCancel, (o: Order) => {
      this.deleteOrder(o);
    });
  }

  onOrderCreated = async (o: Order) => {
    let orders: Order[] = this.orders.get(o.stockId);
    const index: number = this.findDuplicatedOrderIndex(o, orders);
    if (index != -1) {
      // すでに同様のorderが存在する場合は上書きする
      orders = this.deleteOrder(orders[index]);
    }
    orders.push(o);
    this.orders.set(o.stockId, orders);

    // 作成されたorderに関してのみagreeさせれば良い
    this.agreeOrderIfConditionMatched(o);
  };

  onOrderAgreed = (bid: Order, ask: Order) => {
    try {
      const stock: Stock = this.stocks.get(bid.stockId);
      // TODO 任意の数量の株をtransferできるようにする
      stock.transfer(bid.userId, ask.userId, ask.amount);
      stock.setLatestPrice(ask.price);
      console.log(`set price ${stock.id}: ${stock.latestPrice}`);
      this.deleteOrder(bid);
      this.deleteOrder(ask);
    } catch (e) {
      if (e.message == InsufficientBalanceError.message) {
        console.error(e.message);
        this.deleteOrder(bid);
        return;
      }
      if (e.message == NoBalanceError.message) {
        console.error(e.message);
        this.deleteOrder(bid);
        return;
      }
      console.error(e);
    }
  };

  setOrder(order: Order) {
    this.event.emit(EventType.OrderCreate, order);
  }

  deleteOrder(order: Order): Order[] {
    const orders = this.orders
      .get(order.stockId)
      .filter((o: Order) => o.orderId != order.orderId);
    this.orders.set(order.stockId, orders);
    return orders;
  }

  cancelOrder(order: Order) {
    this.event.emit(EventType.OrderCancel, order);
  }

  agreeOrders(bid: Order, ask: Order) {
    this.event.emit(EventType.OrderAgreed, bid, ask);
  }

  agreeOrderIfConditionMatched(o: Order) {
    const matchingOrders: Order[] = this.orders
      .get(o.stockId)
      .filter((mo: Order) => mo.type != o.type)
      .sort((a: Order, b: Order) => (a.createdAt > b.createdAt ? 1 : -1));

    const index: number = matchingOrders.findIndex(
      (mo: Order) => o.price == mo.price
    );
    if (index == -1) {
      return;
    }
    const mo: Order = matchingOrders[index];
    const bid: Order = o.type == "bid" ? o : mo;
    const ask: Order = o.type == "bid" ? mo : o;
    this.agreeOrders(bid, ask);
  }
}
