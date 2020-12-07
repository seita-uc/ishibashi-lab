import * as math from "mathjs";

import Worker from "./class/worker";
import Manager from "./class/manager";
import Task from "./class/task";
import Market from "./class/market";
import Stock from "./class/stock";

// 試行回数
const tryNum: number = 1000;
const workerNum: number = 100;
const taskNum: number = 30;

// workerの生成
const workers: Worker[] = [];
for (let i = 0; i < workerNum; i++) {
  const w: Worker = new Worker(i, i * 10 + 10);
  workers.push(w);
}

const stocks: Stock[] = workers.map((w: Worker) => new Stock(w.id));
const market: Market = new Market(stocks);

const medianPotential: number = math.median(
  workers.map((w: Worker) => w.potential)
);

const manager: Manager = new Manager(workerNum + 1);

for (let i = 0; i < tryNum; i++) {
  const tasks: Task[] = [];
  for (let v = 0; v < taskNum; v++) {
    const task: Task = new Task(v, manager);
    tasks.push(task);
  }

  manager.assignWorkersToTasks(workers, tasks);
  //console.log(tasks);

  for (const task of tasks) {
    // workersのpotentialの中央値*taskの人数が成功の閾値
    // TODO 成功の閾値によって成功率が変化してしまうため、どのように閾値を算出するかちゃんと考える必要がある
    const threshold = medianPotential * task.assignedWorkers.length;
    task.setThresholdToBeCompleted(threshold);

    // taskが終了してworkerにpotentialがpopulateされる
    task.end();
  }

  const successfulTasks: Task[] = tasks.filter((t: Task) => t.isCompleted());
  const successRate: number = successfulTasks.length / tasks.length;
  console.log(successRate * 100);

  console.log(market);
  // TODO taskが終わるたびに、valueの売買を行う
  // 各workerが他のworkerのpreceivedPotentialを保持していて、一緒のtaskをやれば一旦potentialの近似値がわかる
  // もしperceivedPotentialとvalueの値が乖離していたら売買する
}
