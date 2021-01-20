import { getRandomInt, logger } from "./util/util";
import Worker from "./class/worker";
import Manager from "./class/manager";
import Task from "./class/task";
import Market from "./class/market";
import Stock from "./class/stock";
import Coin from "./class/coin";
import * as ObjectsToCsv from "objects-to-csv";

//
// ログレベルの設定
//
logger.level = "info";
//logger.level = "debug";

//
// 試行回数
//
const tryNum: number = 100;
const workerNum: number = 50;
const taskNum: number = 10;
const minPotential: number = 1;
const maxPotential: number = 100;

//
// workerの生成
// coinの発行
//
const coin: Coin = new Coin();
const workers: Worker[] = [];
for (let i = 0; i < workerNum; i++) {
  const w: Worker = new Worker(i, minPotential, maxPotential);
  coin.issue(w.id, 50000);
  workers.push(w);
}

//
// workerのppのランダム生成
//
// TODO きれいにppが別れるようにする
// TODO 知らない人のppの初期値をどうするか考える
workers.forEach((w) => w.initializePerceivedPotentials(workers));

//
// 変数の定義
//
const maxIssueNum: number = 10000;
const stocks: Stock[] = workers.map(
  (w: Worker) => new Stock(w.id, maxIssueNum)
);
const market: Market = new Market(stocks, coin);
const manager: Manager = new Manager(workerNum + 1);
const successRates = [];
const diffRates = [];

(async () => {
  try {
    market.start();

    const totalPotential: number = workers
      .map((w: Worker) => w.potential)
      .reduce((r: number, sum: number) => sum + r);
    const totalMinPotential: number = workers.length * minPotential;

    for (let i = 0; i < tryNum; i++) {
      logger.debug(`tryNun: ${i}`);
      const tasks: Task[] = [];
      for (let v = 0; v < taskNum; v++) {
        // thresholdの設定方法をsimulation間で統一する
        const threshold: number = getRandomInt(
          totalMinPotential / taskNum,
          totalPotential / taskNum
        );
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
      successRates.push(successRate);

      const promises = [];
      for (const w of workers) {
        // perceived potentialを加味して必要があればorderを作成する
        promises.push(w.reflectMarketStatus(market));
      }
      await Promise.all(promises);

      const diffs = workers.map((w) => {
        return (
          ((market.stocks.get(w.id).latestPrice - w.potential) / w.potential) *
          100
        );
      });
      diffRates.push(diffs);
    }
  } catch (e) {
    logger.error(e);
  }

  //
  // 結果を出力する
  //
  //const overallSuccessRate: number =
  //successRates.reduce((r, sum) => sum + r) / successRates.length;

  //全タスクの成功率の平均;
  //logger.debug(overallSuccessRate);

  workers.forEach((w) => {
    const s = market.stocks.get(w.id);
    logger.debug(`${w.id}: potential ${w.potential}, value ${s.latestPrice}`);
  });

  //
  // 結果のcsvを標準出力に吐き出す
  //
  //const data = successRates.map((rate, index) => {
  //return {
  //tryNum: index + 1,
  //successRate: rate,
  //};
  //});
  //const csv = new ObjectsToCsv(data);
  //console.log(await csv.toString());

  const data = diffRates.map((rates, index) => {
    let result = {
      tryNum: index + 1,
    };
    for (let i = 0; i < rates.length; i++) {
      result[`worker_${i}`] = rates[i];
    }
    return result;
  });
  const csv = new ObjectsToCsv(data);
  console.log(await csv.toString());
})();
