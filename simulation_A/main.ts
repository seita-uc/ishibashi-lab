import * as math from "mathjs";

import Worker from "./class/worker";
import Evaluator from "./class/evaluator";
import Manager from "./class/manager";
import Task from "./class/task";

// 試行回数
const tryNum: number = 100;
const workerNum: number = 100;
const taskNum: number = 30;

// workerの生成
const workers: Worker[] = [];
for (let i = 0; i < workerNum; i++) {
  const w: Worker = new Worker(i, i * 10 + 10);
  workers.push(w);
}

const medianPotential: number = math.median(
  workers.map((w: Worker) => w.potential)
);

const manager: Manager = new Manager(100);
const evaluator: Evaluator = new Evaluator(99);

for (let i = 0; i < tryNum; i++) {
  const tasks: Task[] = [];
  for (let v = 0; v < taskNum; v++) {
    const task: Task = new Task(v, manager);
    tasks.push(task);
  }

  manager.assignWorkersToTasks(workers, tasks);

  for (const task of tasks) {
    // workersのpotentialの中央値*taskの人数が成功の閾値
    // TODO 成功の閾値によって成功率が変化してしまうため、どのように閾値を算出するかちゃんと考える必要がある
    const threshold = medianPotential * task.assignedWorkers.length;
    task.setThresholdToBeCompleted(threshold);

    evaluator.evaluate(task);
  }
  const successfulTasks: Task[] = tasks.filter((t: Task) => t.isCompleted());
  const successRate: number = successfulTasks.length / tasks.length;
  console.log(successRate * 100);
}
console.log(workers);
