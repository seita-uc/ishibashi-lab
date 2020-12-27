import { getRandomInt } from "./util/util";
import Worker from "./class/worker";
import Manager from "./class/manager";
import Task from "./class/task";
import Market from "./class/market";
import Stock from "./class/stock";

//
// 試行回数
//
const tryNum: number = 1000;
const workerNum: number = 100;
const taskNum: number = 10;

//
// workerの生成
//
const workers: Worker[] = [];
for (let i = 0; i < workerNum; i++) {
  const w: Worker = new Worker(i);
  workers.push(w);
}

//
// workerのppのランダム生成
//
// TODO きれいにppが別れるようにする
workers.forEach((w) => w.initializePerceivedPotentials(workers));

//
// 変数の定義
//
const stocks: Stock[] = workers.map((w: Worker) => new Stock(w.id));
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
    //const randIndex = getRandomInt(0, workerNum - 1);
    //const worker = workers[randIndex];
    const worker = workers[i];
    stock.issue(worker.id, portionNum);
  }
}

(async () => {
  try {
    market.start();

    const totalPotential: number = workers
      .map((w: Worker) => w.potential)
      .reduce((r: number, sum: number) => sum + r);

    for (let i = 0; i < tryNum; i++) {
      // TODO marketからstockを取得するようにする
      console.log(`tryNun: ${i}`);
      const tasks: Task[] = [];
      for (let v = 0; v < taskNum; v++) {
        const threshold: number = getRandomInt(10, totalPotential / taskNum);
        const task: Task = new Task(v, manager, threshold);
        tasks.push(task);
      }

      // TODO sortした結果ではなくランダムに閾値を満たすようにassignする
      manager.assignWorkersToTasks(workers, tasks, market);

      for (const task of tasks) {
        // taskが終了してworkerにpotentialがpopulateされる
        task.end();
      }

      const successfulTasks: Task[] = tasks.filter((t: Task) =>
        t.isCompleted()
      );
      const successRate: number = (successfulTasks.length / tasks.length) * 100;
      overallSuccessRates.push(successRate);

      // TODO ここのfor loopを非同期かする
      const promises = [];

      for (const w of workers) {
        // perceived potentialを加味して必要があればorderを作成する
        //const startTime = Date.now(); // 開始時間
        promises.push(w.reflectMarketStatus(market));
        //const endTime = Date.now(); // 終了時間
        //console.log(endTime - startTime);
      }
      //const startTime = Date.now(); // 開始時間
      await Promise.all(promises);
      //const endTime = Date.now(); // 終了時間
      //console.log(endTime - startTime);
    }
  } catch (e) {
    console.error(e);
  }

  const overallSuccessRate: number =
    overallSuccessRates.reduce((r, sum) => sum + r) /
    overallSuccessRates.length;
  // 全タスクの成功率の平均
  console.log(overallSuccessRate);

  workers.forEach((w) => {
    const s = market.stocks.get(w.id);
    console.log(`${w.id}: potential ${w.potential}, value ${s.latestPrice}`);
  });
})();
