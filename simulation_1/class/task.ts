import Worker from "./worker";

export default class Task {
  id: number;
  thresholdToBeCompleted: number = 0;
  manager: Worker;
  assignedWorkers: Worker[] = [];

  constructor(id: number, manager: Worker) {
    this.id = id;
    this.manager = manager;
  }

  setThresholdToBeCompleted(threshold: number) {
    this.thresholdToBeCompleted = threshold;
  }

  assignWorker(worker: Worker) {
    this.assignedWorkers.push(worker);
  }

  isCompleted(): boolean {
    const potentials: number[] = this.assignedWorkers.map(
      (w: Worker) => w.potential
    );
    const sum: number = potentials.reduce((sum: number, p: number) => sum + p);
    return sum > this.thresholdToBeCompleted;
  }

  getReputationSum(): number {
    let sum: number = 0;
    for (const w of this.assignedWorkers) {
      sum += w.reputation;
    }
    return sum;
  }
}
