import { getRandomInt } from "../util/util";
import { InsufficientStockBalanceError, NoStockBalanceError } from "./error";

export default class Stock {
  id: number;
  totalIssued: number = 0;
  latestPrice: number = 0;
  owners: Map<number, number> = new Map<number, number>();

  constructor(id: number) {
    this.id = id;
    // reputationと同様、乱数でpriceを決める
    //this.latestPrice = getRandomInt(1, 100);
    this.latestPrice = 1;
  }

  setLatestPrice(price: number) {
    this.latestPrice = price;
  }

  issue(to: number, amount: number) {
    let totalAmount = amount;
    if (this.owners.has(to)) {
      totalAmount += this.owners.get(to);
    }
    this.owners.set(to, totalAmount);
    this.totalIssued += amount;
  }

  balanceOf(owner: number): number {
    if (!this.owners.has(owner)) {
      return 0;
    }
    return this.owners.get(owner);
  }

  transfer(from: number, to: number, amount: number) {
    if (!this.owners.has(from)) {
      throw NoStockBalanceError;
    }
    let fromBalance: number = this.owners.get(from);
    if (fromBalance < amount) {
      throw InsufficientStockBalanceError;
    }
    let toBalance: number = 0;
    if (this.owners.has(to)) {
      toBalance = this.owners.get(to);
    }
    this.owners.set(from, fromBalance - amount);
    this.owners.set(to, toBalance + amount);
  }
}
