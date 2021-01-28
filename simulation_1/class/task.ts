import Worker from "./worker";

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

  isCompleted(): boolean {
    if (this.assignedWorkers.length === 0) {
      return false;
    }
    return this.getPotentialSum() >= this.thresholdToBeCompleted;
  }

  getReputationSum(): number {
    let sum: number = 0;
    for (const w of this.assignedWorkers) {
      sum += w.reputation;
    }
    return sum;
  }

  getPotentialSum(): number {
    let sum: number = 0;
    for (const w of this.assignedWorkers) {
      sum += w.potential;
    }
    return sum;
  }
}
