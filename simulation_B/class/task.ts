import { getRandomInt } from "../util/util";
import Worker from "./worker";
import Market from "./market";

export default class Task {
  id: number;
  thresholdToBeCompleted: number = 0;
  manager: Worker;
  assignedWorkers: Worker[] = [];

  constructor(id: number, manager: Worker, threshold: number) {
    this.id = id;
    this.manager = manager;
    this.thresholdToBeCompleted = threshold;
  }

  assignWorker(worker: Worker) {
    this.assignedWorkers.push(worker);
  }

  // task終了時に他のworkerのpotentialを認識する
  end() {
    for (const worker of this.assignedWorkers) {
      for (const w of this.assignedWorkers) {
        if (worker.id === w.id) {
          continue;
        }
        // TODO potentialの近似値を持つ
        //worker.setPerceivedPotential(w.id, w.potential);
        worker.setPerceivedPotential(
          w.id,
          getRandomInt(w.potential - 5, w.potential + 5)
        );
      }
    }
  }

  isCompleted(): boolean {
    if (this.assignedWorkers.length == 0) {
      return false;
    }
    const potentials: number[] = this.assignedWorkers.map(
      (w: Worker) => w.potential
    );
    const sum: number = potentials.reduce((sum: number, p: number) => sum + p);
    return sum > this.thresholdToBeCompleted;
  }

  getValueSum(market: Market): number {
    let sum: number = 0;
    for (const w of this.assignedWorkers) {
      const stock = market.stocks.get(w.id);
      sum += stock.latestPrice;
    }
    return sum;
  }
}
