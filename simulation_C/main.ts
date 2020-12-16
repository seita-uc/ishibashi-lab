import { getRandomInt } from "./util/util";
import Worker from "./class/worker";
import Evaluator from "./class/evaluator";
import Manager from "./class/manager";
import Task from "./class/task";

// 試行回数
const tryNum: number = 100;
const workerNum: number = 10;
const taskNum: number = 5;

// workerの生成
const workers: Worker[] = [];
for (let i = 0; i < workerNum; i++) {
  const potential = getRandomInt(10, 100);
  const w: Worker = new Worker(i, potential);
  //const w: Worker = new Worker(i, i * 10 + 10);
  workers.push(w);
}

const manager: Manager = new Manager(100);
const evaluator: Evaluator = new Evaluator(99);

const overallSuccessRates = [];
for (let i = 0; i < tryNum; i++) {
  const totalPotential: number = workers
    .map((w: Worker) => w.potential)
    .reduce((r: number, sum: number) => sum + r);
  const tasks: Task[] = [];
  for (let v = 0; v < taskNum; v++) {
    // TODO reputationの合計値をtaskの総数で割った数が最大値の乱数にした理由をまとめる
    const threshold: number = getRandomInt(10, totalPotential / taskNum);
    const task: Task = new Task(v, manager, threshold);
    tasks.push(task);
  }

  manager.assignWorkersToTasks(workers, tasks);

  for (const task of tasks) {
    if (!task.isCompleted()) {
      console.log(task);
    }
    evaluator.evaluate(task);
  }
  const successfulTasks: Task[] = tasks.filter((t: Task) => t.isCompleted());
  const successRate: number = (successfulTasks.length / tasks.length) * 100;
  console.log(successRate);

  overallSuccessRates.push(successRate);
}
console.log(workers);

const overallSuccessRate: number =
  overallSuccessRates.reduce((r, sum) => sum + r) / overallSuccessRates.length;
// 全タスクの成功率の平均
console.log(overallSuccessRate);
