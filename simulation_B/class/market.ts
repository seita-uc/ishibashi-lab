import { EventEmitter } from "events";
import {
  InsufficientStockBalanceError,
  NoStockBalanceError,
  InsufficientCoinBalanceError,
  NoCoinBalanceError,
  OrderPriceMismatchError,
} from "./error";
import { logger } from "../util/util";
import Order from "./order";
import Stock from "./stock";
import Coin from "./coin";

const EventType = {
  OrderCreate: "order.create",
  OrderAgreed: "order.agreed",
  OrderCancel: "order.cancel",
};

export default class Market {
  orders: Map<number, Order[]> = new Map<number, Order[]>();
  stocks: Map<number, Stock> = new Map<number, Stock>();
  coin: Coin;
  event: EventEmitter;

  constructor(stocks: Stock[], coin: Coin) {
    for (const s of stocks) {
      this.stocks.set(s.id, s);
      this.orders.set(s.id, []);
    }
    this.coin = coin;
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
  start() {
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
    if (bid.price !== ask.price) {
      throw OrderPriceMismatchError;
    }

    // TODO agreeした金額と同一のorderがあればそのorderのpriceを変化させる
    try {
      const stock: Stock = this.stocks.get(bid.stockId);

      let stockTransferAmount: number =
        ask.amount >= bid.amount ? bid.amount : ask.amount;

      // transferが失敗した時に前の状態に戻す
      const transferCoinAmount: number = stockTransferAmount * bid.price;
      this.coin.transfer(ask.userId, bid.userId, transferCoinAmount);
      stock.transfer(bid.userId, ask.userId, stockTransferAmount);

      if (ask.amount >= bid.amount) {
        ask.amount = ask.amount - stockTransferAmount;
        this.deleteOrder(bid);
      }
      if (ask.amount < bid.amount) {
        bid.amount = bid.amount - stockTransferAmount;
        this.deleteOrder(ask);
      }

      stock.setLatestPrice(ask.price);
      logger.debug(`set price ${stock.id}: ${stock.latestPrice}`);

      // 同様のorderがある場合、askは価格を下げ、bidは価格をあげる
      const orders: Order[] = this.orders.get(stock.id);
      const samePriceOrders: Order[] = orders.filter(
        (o) => o.price == ask.price
      );
      if (samePriceOrders.length != 0) {
        for (const o of samePriceOrders) {
          o.price = o.type == "bid" ? o.price + 1 : o.price - 1;
        }
      }
    } catch (e) {
      if (
        e.message == InsufficientStockBalanceError.message ||
        e.message == NoStockBalanceError.message
      ) {
        logger.error(e.message);
        this.deleteOrder(bid);
        return;
      }
      if (
        e.message == InsufficientCoinBalanceError.message ||
        e.message == NoCoinBalanceError.message
      ) {
        logger.error(e.message);
        this.deleteOrder(ask);
        return;
      }
      logger.error(e.message);
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
    while (true) {
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

      // coinの残高確認
      if (this.coin.balanceOf(ask.userId) < ask.price * ask.amount) {
        this.deleteOrder(ask);
        continue;
      }
      // stockの残高確認
      if (this.stocks.get(o.stockId).balanceOf(bid.userId) < bid.amount) {
        this.deleteOrder(bid);
        continue;
      }
      return this.agreeOrders(bid, ask);
    }
  }
}
