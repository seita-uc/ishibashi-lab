import { getRandomInt, logger } from "../util/util";
import Stock from "./stock";
import Order from "./order";
import Market from "./market";
import Coin from "./coin";

export default class Worker {
  id: number; //連番
  potential: number; // 1-100の乱数
  perceivedPotentials: Map<number, number> = new Map<number, number>();
  coin: number;

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
    const priceGaps = new Map<number, number>();
    for (const entry of this.perceivedPotentials.entries()) {
      const workerId: number = entry[0];
      const perceivedPotential: number = entry[1];
      const stock: Stock = market.stocks.get(workerId);
      const priceGap: number = perceivedPotential - stock.latestPrice;
      priceGaps.set(workerId, priceGap);
    }

    // ppとpriceのgapが大きい順にsort
    const stockIds: number[] = Array.from(priceGaps.entries())
      .sort((a, b) => {
        const agap = a[1];
        const bgap = b[1];
        return agap < bgap ? 1 : -1;
      })
      .map((array) => array[0]);

    const promises = [];
    for (const stockId of stockIds) {
      const perceivedPotential = this.perceivedPotentials.get(stockId);
      // TODO 全ての銘柄のうちでppとlatestPriceの差でsortして上から全買いしていく
      // TODO 一番値上がり益が大きそうな物を買う
      // coinの残高を確認する
      promises.push(
        this.createOrderIfNecessary(stockId, perceivedPotential, market)
      );
    }
    await Promise.all(promises);
  }

  // TODO coinもbalanceを考慮してorderを作成する
  async createOrderIfNecessary(
    workerId: number,
    perceivedPotential: number,
    market: Market
  ) {
    const stock: Stock = market.stocks.get(workerId);
    const orders: Order[] = market.orders.get(stock.id);
    const coin: Coin = market.coin;

    // TODO perceivedPotentialだけでなく、将来的にcoinを増やそうとするインセンティブをシステムに組み込まないといけない
    // TODO 正しいpotentialを知っているひとだけでなく正しくないpotentialを持っている人が参加するため、valueがpotentialに近似しない
    if (stock.latestPrice < perceivedPotential) {
      //
      // 買い注文
      //
      if (coin.balanceOf(this.id) <= stock.latestPrice) {
        return;
      }
      const order = this.createAskOrder(
        stock,
        orders,
        perceivedPotential,
        coin
      );
      market.setOrder(order);
      return;
    }

    // 持っていないと売れない
    if (
      stock.latestPrice > perceivedPotential &&
      stock.balanceOf(this.id) > 0
    ) {
      //
      // 売り注文
      //
      const order = this.createBidOrder(stock, orders, perceivedPotential);
      market.setOrder(order);
      return;
    }
  }

  createAskOrder(
    stock: Stock,
    orders: Order[],
    perceivedPotential: number,
    coin: Coin
  ): Order {
    // TODO coinの残高
    // 買える分だけ買う
    // 一番値上がり益が大きそうな物を買う
    // ppとlatestPriceの差が一番大きい銘柄
    const balance = coin.balanceOf(this.id);
    const buyableAmount = Math.floor(balance / stock.latestPrice);
    logger.debug("balance: ", balance);
    logger.debug("price: ", stock.latestPrice);
    logger.debug("buyableAmount: ", buyableAmount);

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
    //coin: Coin
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
