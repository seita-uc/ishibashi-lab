export default class Stock {
  id: number;
  totalIssued: number = 1000;
  latestPrice: number = 0;
  owners: Map<number, number> = new Map<number, number>();

  constructor(id: number, latestPrice: number) {
    this.id = id;
    // reputationと同様、乱数でpriceを決める
    this.latestPrice = latestPrice;
    // id: -1に全て発行
    this.owners.set(-1, this.totalIssued);
  }

  setLatestPrice(price: number) {
    this.latestPrice = price;
  }

  transfer(from: number, to: number, amount: number) {
    if (!this.owners.has(from)) {
      throw "from user does not have any balance";
    }
    let fromBalance: number = this.owners.get(from);
    if (fromBalance < amount) {
      throw "from user balance is not enough to transfer";
    }
    let toBalance: number = 0;
    if (this.owners.has(to)) {
      toBalance = this.owners.get(to);
    }
    this.owners.set(from, fromBalance - amount);
    this.owners.set(to, toBalance + amount);
  }
}
