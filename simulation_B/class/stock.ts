export default class Stock {
  id: number;
  totalIssued: number = 1000;
  latestPrice: number = 0;
  owners: Map<number, number> = new Map<number, number>();

  constructor(id: number) {
    this.id = id;
    // id: -1に全て発行
    this.owners.set(-1, this.totalIssued);
  }

  setLatestPrice(price: number) {
    this.latestPrice = price;
  }

  //transfer(from: number, to: number, amount: number) {
  //this.owners.set(-1, this.totalIssued);
  //this.owners.set(-1, this.totalIssued);
  //}
}
