import { getRandomInt } from "./util/util";
import Worker from "./class/worker";
import Evaluator from "./class/evaluator";
import Manager from "./class/manager";
import Task from "./class/task";
import * as ObjectsToCsv from "objects-to-csv";

// 試行回数
const tryNum: number = 100;
const workerNum: number = 50;
const taskNum: number = 10;
const minPotential: number = 1;
const maxPotential: number = 100;

// workerの生成
const workers: Worker[] = [];
for (let i = 0; i < workerNum; i++) {
  const potential = getRandomInt(minPotential, maxPotential);
  const w: Worker = new Worker(i, potential);
  workers.push(w);
}

const manager: Manager = new Manager(100);
const evaluator: Evaluator = new Evaluator(99);

const successRates = [];
const overallDiffs = [];
for (let i = 0; i < tryNum; i++) {
  const totalPotential: number = workers
    .map((w: Worker) => w.potential)
    .reduce((r: number, sum: number) => sum + r);
  const totalMinPotential: number = workers.length * minPotential;
  const tasks: Task[] = [];
  for (let v = 0; v < taskNum; v++) {
    const threshold: number = getRandomInt(
      totalMinPotential / taskNum,
      totalPotential / taskNum
    );
    const task: Task = new Task(v, manager, threshold);
    tasks.push(task);
  }

  manager.assignWorkersToTasks(workers, tasks);

  for (const task of tasks) {
    if (!task.isCompleted()) {
    }
    evaluator.evaluate(task);
  }

  const successfulTasks: Task[] = tasks.filter((t: Task) => t.isCompleted());
  const successRate: number = (successfulTasks.length / tasks.length) * 100;
  successRates.push(successRate);

  const diffs = workers.map((w) => {
    return Math.abs(w.reputation - w.potential);
  });
  overallDiffs.push(diffs);
}

//
// 結果のcsvを標準出力に吐き出す
//
//(async () => {
//const data = successRates.map((rate, index) => {
//return {
//tryNum: index + 1,
//successRate: rate,
//};
//});
//const csv = new ObjectsToCsv(data);
//console.log(await csv.toString());
//})();

(async () => {
  const data = overallDiffs.map((diffs, index) => {
    let result = {
      tryNum: index + 1,
    };
    for (let i = 0; i < diffs.length; i++) {
      result[`worker_${i}`] = diffs[i];
    }
    return result;
  });
  const csv = new ObjectsToCsv(data);
  console.log(await csv.toString());
})();
