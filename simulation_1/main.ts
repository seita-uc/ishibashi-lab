import * as math from "mathjs";

import Worker from "./class/worker";
import Evaluator from "./class/evaluator";
import Manager from "./class/manager";
import Task from "./class/task";

// workerの生成
const workers: Worker[] = [];
for (let i = 0; i < 10; i++) {
  const w: Worker = new Worker(i, i * 10 + 10);
  workers.push(w);
}

const medianPotential: number = math.median(
  workers.map((w: Worker) => w.potential)
);

const manager: Manager = new Manager(100);
const evaluator: Evaluator = new Evaluator(99);

for (let i = 0; i < 100; i++) {
  const task1: Task = new Task(0, manager);
  const task2: Task = new Task(1, manager);
  const task3: Task = new Task(2, manager);
  const tasks: Task[] = [task1, task2, task3];

  manager.assignWorkersToTasks(workers, tasks);

  for (const task of tasks) {
    // workersのpotentialの中央値*taskの人数が成功の閾値
    // TODO 成功の閾値によって成功率が変化してしまうため、どのように閾値を算出するかちゃんと考える必要がある
    const threshold = medianPotential * task.assignedWorkers.length;
    task.setThresholdToBeCompleted(threshold);

    evaluator.evaluate(task);
    //console.log(task.isCompleted());
  }
  const successfulTasks: Task[] = tasks.filter((t: Task) => t.isCompleted());
  const successRate: number = successfulTasks.length / tasks.length;
  console.log(successRate * 100);

  // taskの成否によってreputationが増減する
  // taskが失敗 => reputation - 5
  // taskが成功した場合はevaluatorがworkerのpotentialの近似値によって評価する
  // reputation + (potentialの近似値/10)
  // 近似率から値を求める => 方法は?
}
console.log(workers);
