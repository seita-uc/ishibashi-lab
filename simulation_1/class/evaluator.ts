import Worker from "./worker";
import Task from "./task";

export default class Evaluator extends Worker {
  potentialApproximationRate: number = 80;

  constructor(id: number) {
    super(id);
  }

  evaluate(task: Task) {
    for (const worker of task.assignedWorkers) {
      if (task.isCompleted()) {
        // TODO 近似率を加味する
        worker.reputation += worker.potential / 10;
        continue;
      }
      worker.reputation -= 5;
    }
  }
}
