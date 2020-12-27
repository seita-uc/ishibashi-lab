import { getRandomInt } from "../util/util";
import Stock from "./stock";
import Order from "./order";
import Market from "./market";

export default class Worker {
  id: number; //連番
  potential: number; // 1-100の乱数
  perceivedPotentials: Map<number, number> = new Map<number, number>();

  // TODO coinの概念を導入する
  constructor(id: number) {
    this.id = id;
    this.potential = getRandomInt(10, 100);
  }

  setPerceivedPotential(workerId: number, potential: number) {
    this.perceivedPotentials.set(workerId, potential);
  }

  initializePerceivedPotentials(workers: Worker[]) {
    for (const w of workers) {
      if (this.id == w.id) {
        continue;
      }
      const pp = getRandomInt(1, 100);
      this.setPerceivedPotential(w.id, pp);
    }
  }

  async reflectMarketStatus(market: Market) {
    const promises = [];
    for (const entry of this.perceivedPotentials.entries()) {
      const workerId: number = entry[0];
      const perceivedPotential: number = entry[1];
      promises.push(
        this.createOrderIfNecessary(workerId, perceivedPotential, market)
      );
    }
    await Promise.all(promises);
  }

  async createOrderIfNecessary(
    workerId: number,
    perceivedPotential: number,
    market: Market
  ) {
    const stock: Stock = market.stocks.get(workerId);
    const orders: Order[] = market.orders.get(stock.id);

    // TODO perceivedPotentialだけでなく、将来的にcoinを増やそうとするインセンティブをシステムに組み込まないといけない
    // TODO 正しいpotentialを知っているひとだけでなく正しくないpotentialを持っている人が参加するため、valueがpotentialに近似しない
    if (stock.latestPrice < perceivedPotential) {
      const order = this.createAskOrder(stock, orders, perceivedPotential);
      market.setOrder(order);
      return;
    }

    // 持っていないと売れない
    if (
      stock.latestPrice > perceivedPotential &&
      stock.balanceOf(this.id) > 0
    ) {
      const order = this.createBidOrder(stock, orders, perceivedPotential);
      market.setOrder(order);
      return;
    }
  }

  createAskOrder(
    stock: Stock,
    orders: Order[],
    perceivedPotential: number
  ): Order {
    const index = orders
      .sort((a, b) => (a.price < b.price ? -1 : 1))
      .findIndex((o) => o.type == "bid" && o.price < perceivedPotential);
    if (index !== -1) {
      return new Order(
        stock.id,
        this.id,
        "ask",
        orders[index].price,
        1 // TODO 買えるだけかう
      );
    }

    return new Order(
      stock.id,
      this.id,
      "ask",
      stock.latestPrice + 1,
      1 // TODO 買えるだけかう
    );
  }

  createBidOrder(
    stock: Stock,
    orders: Order[],
    perceivedPotential: number
  ): Order {
    const index = orders
      .sort((a, b) => (a.price > b.price ? -1 : 1))
      .findIndex((o) => o.type == "ask" && o.price > perceivedPotential);
    if (index !== -1) {
      return new Order(
        stock.id,
        this.id,
        "bid",
        orders[index].price,
        1 // TODO 売れるだけ売る
      );
    }

    return new Order(
      stock.id,
      this.id,
      "bid",
      stock.latestPrice - 1,
      1 // TODO 売れるだけ売る
    );
  }
}
