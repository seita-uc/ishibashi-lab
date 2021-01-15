import { getRandomInt } from "../util/util";
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
  constructor(id: number, minPotential: number, maxPotential: number) {
    this.id = id;
    this.potential = getRandomInt(minPotential, maxPotential);
  }

  setPerceivedPotential(workerId: number, potential: number) {
    this.perceivedPotentials.set(workerId, potential);
  }

  initializePerceivedPotentials(workers: Worker[]) {
    for (const w of workers) {
      if (this.id == w.id) {
        continue;
      }
      //const pp = getRandomInt(1, 100);
      this.setPerceivedPotential(w.id, 1);
      //this.setPerceivedPotential(w.id, pp);
    }
  }

  async reflectMarketStatus(market: Market) {
    // TODO IPOを実装
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
    if (
      stock.latestPrice < perceivedPotential &&
      // coinを持っていないと買えない
      coin.balanceOf(this.id) >= stock.latestPrice
    ) {
      //
      // 買い注文
      //

      // offeringしていたら、買えるだけ買う
      if (stock.isPubliclyOffering()) {
        const offerableAmount = stock.maxIssueNum - stock.totalIssued;
        const buyableAmount = this.getBuyableAmount(
          coin.balanceOf(this.id),
          stock.latestPrice
        );
        if (offerableAmount > buyableAmount) {
          stock.issue(this.id, buyableAmount);
          coin.transfer(this.id, -1, buyableAmount);
          return;
        }
        stock.issue(this.id, offerableAmount);
        coin.transfer(this.id, -1, offerableAmount);
        return;
      }

      const order = this.createAskOrder(
        stock,
        orders,
        perceivedPotential,
        coin
      );
      market.setOrder(order);
    }

    // TODO decayを実装してすぐ株を手放すインセンティブをつくる
    if (
      //stock.latestPrice > perceivedPotential &&
      // stockを持っていないと売れない
      stock.balanceOf(this.id) > 0
    ) {
      //
      // 売り注文
      //
      const order = this.createBidOrder(stock, orders, perceivedPotential);
      market.setOrder(order);
      //return;
    }
  }

  getBuyableAmount(balance: number, price: number): number {
    return Math.floor(balance / price);
  }

  createAskOrder(
    stock: Stock,
    orders: Order[],
    perceivedPotential: number,
    coin: Coin
  ): Order {
    // 買える分だけ買う
    let askPrice = stock.latestPrice - 1;
    const index = orders
      .sort((a, b) => (a.price < b.price ? -1 : 1))
      .findIndex((o) => o.type == "bid" && o.price < perceivedPotential);
    if (index !== -1) {
      askPrice = orders[index].price;
    }
    const buyableAmount = this.getBuyableAmount(
      coin.balanceOf(this.id),
      askPrice
    );
    return new Order(stock.id, this.id, "ask", askPrice, buyableAmount);
  }

  createBidOrder(
    stock: Stock,
    orders: Order[],
    perceivedPotential: number
  ): Order {
    let bidPrice = stock.latestPrice + 1;
    const index = orders
      .sort((a, b) => (a.price > b.price ? -1 : 1))
      .findIndex((o) => o.type == "ask" && o.price > perceivedPotential);
    if (index !== -1) {
      bidPrice = orders[index].price;
    }
    return new Order(
      stock.id,
      this.id,
      "bid",
      bidPrice,
      stock.balanceOf(this.id)
    );
  }
}
