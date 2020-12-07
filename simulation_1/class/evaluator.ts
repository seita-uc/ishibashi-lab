import Worker from "./worker";
import Task from "./task";

export default class Evaluator extends Worker {
  potentialApproximationRate: number = 0.8;

  constructor(id: number) {
    super(id, 100);
  }

  evaluate(task: Task) {
    for (const worker of task.assignedWorkers) {
      // TODO potentialの80%の値がわかるので、相対的には正確に評価できてしまっている
      // TODO 精度が80%になってほしい
      // TODO ダメなevaluatorはここでpotentialを度外視して適当に増減させる
      //const approxPotential: number =
      //worker.potential * this.potentialApproximationRate;
      if (task.isCompleted()) {
        // TODO 近似率を加味する
        // TODO 乱数によりばらつきを付与する
        worker.reputation += 5;
        //worker.reputation += 10;
        continue;
      }
      // potentialの分だけ減少値が小さくなるようにする
      // 全員同じだけ減少させるか？？
      worker.reputation -= 5;
      //worker.reputation -= 100 / approxPotential;
      if (worker.reputation < 0) {
        worker.reputation = 0;
      }
    }
  }
}
