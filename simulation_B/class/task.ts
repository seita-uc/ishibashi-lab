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

  // task終了時に他のworkerのpotentialを認識する
  end() {
    for (const worker of this.assignedWorkers) {
      for (const w of this.assignedWorkers) {
        if (worker.id === w.id) {
          continue;
        }
        worker.setPerceivedPotential(w.id, w.potential);
      }
    }
  }

  isCompleted(): boolean {
    const potentials: number[] = this.assignedWorkers.map(
      (w: Worker) => w.potential
    );
    const sum: number = potentials.reduce((sum: number, p: number) => sum + p);
    return sum > this.thresholdToBeCompleted;
  }

  getValueSum(): number {
    let sum: number = 0;
    for (const w of this.assignedWorkers) {
      sum += w.value;
    }
    return sum;
  }
}
