import Worker from "./worker";
import Task from "./task";

export default class Evaluator extends Worker {
  potentialApproximationRate: number = 80;

  constructor(id: number) {
    super(id, 100);
  }

  evaluate(task: Task) {
    for (const worker of task.assignedWorkers) {
      if (task.isCompleted()) {
        // TODO 近似率を加味する
        worker.reputation += worker.potential / 10;
        continue;
      }
      // potentialの分だけ減少値が小さくなるようにする
      // 全員同じだけ減少させるか？？
      worker.reputation -= 100 / worker.potential;
    }
  }
}
