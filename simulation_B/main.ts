import { getRandomInt } from "./util/util";
import Worker from "./class/worker";
import Manager from "./class/manager";
import Task from "./class/task";
import Market from "./class/market";
import Stock from "./class/stock";
import Order from "./class/order";

// 試行回数
const tryNum: number = 10;
const workerNum: number = 10;
const taskNum: number = 2;

// workerの生成
const workers: Worker[] = [];
for (let i = 0; i < workerNum; i++) {
  const w: Worker = new Worker(i, i * 10 + 10);
  workers.push(w);
}

const stocks: Stock[] = workers.map((w: Worker) => new Stock(w.id, w.value));
const market: Market = new Market(stocks);
const manager: Manager = new Manager(workerNum + 1);

market.start();

const overallSuccessRates = [];
for (let i = 0; i < tryNum; i++) {
  const totalValue: number = workers
    .map((w: Worker) => w.value)
    .reduce((v: number, sum: number) => sum + v);
  const tasks: Task[] = [];
  for (let v = 0; v < taskNum; v++) {
    // TODO taskのreputationの閾値をどう設定するか
    // どのように計算するのが妥当か
    // TODO reputationの合計値をtaskの総数で割った数が最大値の乱数にした理由をまとめる
    const threshold: number = getRandomInt(10, totalValue / taskNum);
    const task: Task = new Task(v, manager, threshold);
    tasks.push(task);
  }

  manager.assignWorkersToTasks(workers, tasks);

  for (const task of tasks) {
    // taskが終了してworkerにpotentialがpopulateされる
    task.end();
  }

  const successfulTasks: Task[] = tasks.filter((t: Task) => t.isCompleted());
  const successRate: number = (successfulTasks.length / tasks.length) * 100;
  console.log(successRate);
  overallSuccessRates.push(successRate);

  for (const w of workers) {
    for (const entry of w.perceivedPotentials.entries()) {
      const workerId: number = entry[0];
      const perceivedPotential: number = entry[1];
      const stock: Stock = market.stocks.get(workerId);

      if (stock.latestPrice < perceivedPotential) {
        // TODO 値動きを表現する
        // TODO 買い注文を出す
        const order: Order = new Order(
          stock.id,
          w.id,
          "ask",
          stock.latestPrice
        );
        market.setOrder(order);
        continue;
      }

      // 持っていないと売れない
      if (stock.latestPrice > perceivedPotential) {
        // TODO 売り注文を出す
        const order: Order = new Order(
          stock.id,
          w.id,
          "bid",
          stock.latestPrice - 1
        );
        market.setOrder(order);
        continue;
      }
    }
  }

  console.log(market.orders);
}

// このままだとorderがなくならず増えるだけ
// 売り注文と買い注文をどのようにマッチさせるのか
// 最初は注文した分だけ買える
// 買える分だけ買う？
// coinの概念をどうするか

//console.log(market);
const overallSuccessRate: number =
  overallSuccessRates.reduce((r, sum) => sum + r) / overallSuccessRates.length;
// 全タスクの成功率の平均
console.log(overallSuccessRate);
// TODO taskが終わるたびに、valueの売買を行う
// 各workerが他のworkerのpreceivedPotentialを保持していて、一緒のtaskをやれば一旦potentialの近似値がわかる
// もしperceivedPotentialとvalueの値が乖離していたら売買する
