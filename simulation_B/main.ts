import { getRandomInt, logger } from "./util/util";
import Worker from "./class/worker";
import Manager from "./class/manager";
import Task from "./class/task";
import Market from "./class/market";
import Stock from "./class/stock";
import Coin from "./class/coin";

//
// ログレベルの設定
//
//logger.level = "info";
logger.level = "debug";

//
// 試行回数
//
const tryNum: number = 100;
const workerNum: number = 100;
const taskNum: number = 10;

//
// workerの生成
// coinの発行
//
const coin: Coin = new Coin();
const workers: Worker[] = [];
for (let i = 0; i < workerNum; i++) {
  const w: Worker = new Worker(i);
  // TODO 仮で1000coin発行
  coin.issue(w.id, 1000);
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
const market: Market = new Market(stocks, coin);
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
      logger.debug(`tryNun: ${i}`);
      const tasks: Task[] = [];
      for (let v = 0; v < taskNum; v++) {
        const threshold: number = getRandomInt(10, totalPotential / taskNum);
        const task: Task = new Task(v, manager, threshold);
        tasks.push(task);
      }

      manager.assignWorkersToTasks(workers, tasks, market);

      for (const task of tasks) {
        // taskが終了してworkerにperceived potentialがpopulateされる
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
        promises.push(w.reflectMarketStatus(market));
      }
      await Promise.all(promises);
    }
  } catch (e) {
    logger.error(e);
  }

  //
  // 結果を出力する
  //
  const overallSuccessRate: number =
    overallSuccessRates.reduce((r, sum) => sum + r) /
    overallSuccessRates.length;
  // 全タスクの成功率の平均
  logger.info(overallSuccessRate);

  workers.forEach((w) => {
    const s = market.stocks.get(w.id);
    logger.info(`${w.id}: potential ${w.potential}, value ${s.latestPrice}`);
  });
  logger.info(coin);
})();
