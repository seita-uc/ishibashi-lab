import Worker from "./worker";

export default class Task {
  id: number;
  thresholdToBeCompleted: number = 250;
  manager: Worker;
  assignedWorkers: Worker[] = [];

  constructor(id: number, manager: Worker) {
    this.id = id;
    this.manager = manager;
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
}
