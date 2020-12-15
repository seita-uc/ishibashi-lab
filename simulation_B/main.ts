import { getRandomInt } from "./util/util";
import Worker from "./class/worker";
import Manager from "./class/manager";
import Task from "./class/task";
import Market from "./class/market";
import Stock from "./class/stock";
import Order from "./class/order";

//
// 試行回数
//
const tryNum: number = 1;
const workerNum: number = 10;
const taskNum: number = 2;

//
// workerの生成
//
const workers: Worker[] = [];
for (let i = 0; i < workerNum; i++) {
  const w: Worker = new Worker(i, i * 10 + 10);
  workers.push(w);
}

//
// workerのppのランダム生成
//
workers.forEach((w) => w.initializePerceivedPotentials(workers));

//
// 変数の定義
//
const stocks: Stock[] = workers.map((w: Worker) => new Stock(w.id, w.value));
const market: Market = new Market(stocks);
const manager: Manager = new Manager(workerNum + 1);
const overallSuccessRates = [];

//
// 初期の株配分
//
const totalIssueNum = 100;
const portionNum = totalIssueNum / workerNum;

// TODO 初期の株配分を実装
for (const stock of stocks) {
  for (let i = 0; i < workerNum; i++) {
    const randIndex = getRandomInt(0, workerNum - 1);
    const worker = workers[randIndex];
    stock.issue(worker.id, portionNum);
  }
}

market.start();

for (let i = 0; i < tryNum; i++) {
  const totalValue: number = workers
    .map((w: Worker) => w.value)
    .reduce((v: number, sum: number) => sum + v);

  const tasks: Task[] = [];
  for (let v = 0; v < taskNum; v++) {
    // TODO valueの合計値をtaskの総数で割った数が最大値の乱数にした理由をまとめる
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
          stock.latestPrice,
          10 // TODO 買えるだけかう
        );
        market.setOrder(order);
        continue;
      }

      // 持っていないと売れない
      if (stock.latestPrice > perceivedPotential && stock.balanceOf(w.id) > 0) {
        // TODO 売り注文を出す
        const order: Order = new Order(
          stock.id,
          w.id,
          "bid",
          stock.latestPrice,
          stock.balanceOf(w.id) // 全部売る
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

const overallSuccessRate: number =
  overallSuccessRates.reduce((r, sum) => sum + r) / overallSuccessRates.length;
// 全タスクの成功率の平均
console.log(overallSuccessRate);
// TODO taskが終わるたびに、valueの売買を行う
// 各workerが他のworkerのpreceivedPotentialを保持していて、一緒のtaskをやれば一旦potentialの近似値がわかる
// もしperceivedPotentialとvalueの値が乖離していたら売買する
