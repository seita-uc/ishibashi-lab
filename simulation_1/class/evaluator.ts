import Worker from "./worker";
import Task from "./task";

export default class Evaluator extends Worker {
  constructor(id: number) {
    super(id, 100);
  }

  evaluate(task: Task) {
    for (const worker of task.assignedWorkers) {
      if (task.isCompleted()) {
        const isExcellent =
          task.getPotentialSum() >= task.thresholdToBeCompleted * 1.5;
        if (isExcellent) {
          worker.reputation += 1.5;
          continue;
        }

        worker.reputation += 1;
        continue;
      }
      worker.reputation -= 1;
      if (worker.reputation < 0) {
        worker.reputation = 0;
      }
    }
  }
}
