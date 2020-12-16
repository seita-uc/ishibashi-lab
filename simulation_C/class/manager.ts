import Worker from "./worker";
import Task from "./task";

export default class Manager extends Worker {
  constructor(id: number) {
    super(id, 100);
  }

  // reputationの閾値に満たすまで割り振る
  assignWorkersToTasks(workers: Worker[], tasks: Task[]) {
    if (tasks.length === 0) {
      throw "tasks must not be empty";
    }
    // thresholdの高い順にtaskをsortする
    tasks.sort((a: Task, b: Task) =>
      a.thresholdToBeCompleted > b.thresholdToBeCompleted ? -1 : 1
    );
    // reputationの高い順にworkerをsortする
    for (const w of workers.sort((aw: Worker, bw: Worker) =>
      aw.reputation < bw.reputation ? 1 : -1
    )) {
      const index: number = tasks.findIndex(
        (t: Task) => t.getReputationSum() < t.thresholdToBeCompleted
      );
      if (index === -1) {
        return;
      }
      tasks[index].assignWorker(w);
    }
  }
}
