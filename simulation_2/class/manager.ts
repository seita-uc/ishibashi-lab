import Worker from "./worker";
import Market from "./market";
import Task from "./task";

export default class Manager extends Worker {
  constructor(id: number) {
    super(id, 0, 0);
  }

  // priceの閾値に満たすまで割り振る
  assignWorkersToTasks(workers: Worker[], tasks: Task[], market: Market) {
    if (tasks.length === 0) {
      throw "tasks must not be empty";
    }
    // thresholdの高い順にtaskをsortする
    tasks.sort((a: Task, b: Task) =>
      a.thresholdToBeCompleted > b.thresholdToBeCompleted ? -1 : 1
    );
    // valueの高い順にworkerをsortする
    for (const w of workers.sort((aw: Worker, bw: Worker) => {
      const as = market.stocks.get(aw.id);
      const bs = market.stocks.get(bw.id);
      return as.latestPrice < bs.latestPrice ? 1 : -1;
    })) {
      const index: number = tasks.findIndex(
        (t: Task) => t.getValueSum(market) < t.thresholdToBeCompleted
      );
      if (index === -1) {
        return;
      }
      tasks[index].assignWorker(w);
    }
  }
}
