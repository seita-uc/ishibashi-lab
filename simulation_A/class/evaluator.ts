import Worker from "./worker";
import Task from "./task";

export default class Evaluator extends Worker {
  constructor(id: number) {
    super(id, 100);
  }

  evaluate(task: Task) {
    for (const worker of task.assignedWorkers) {
      // TODO 精度を設定する
      if (task.isCompleted()) {
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
