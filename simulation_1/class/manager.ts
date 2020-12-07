import Worker from "./worker";
import Task from "./task";

export default class Manager extends Worker {
  constructor(id: number) {
    super(id, 100);
  }

  // reputation高い順に交互に振り分ける
  // TODO taskのreputationのsumで毎回sortする
  assignWorkersToTasks(workers: Worker[], tasks: Task[]) {
    if (tasks.length === 0) {
      throw "tasks must not be empty";
    }
    // reputationの高い順にworkerをsortする
    for (const w of workers.sort((aw: Worker, bw: Worker) =>
      aw.reputation < bw.reputation ? 1 : -1
    )) {
      tasks.sort((at: Task, bt: Task) => {
        const as = at.getReputationSum();
        const bs = bt.getReputationSum();
        if (as !== bs) {
          return as < bs ? 1 : -1;
        }
        const al = at.assignedWorkers.length;
        const bl = bt.assignedWorkers.length;
        if (al === bl) {
          return 0;
        }
        return al < bl ? 1 : -1;
      });
      // 一番reputationの合計値が低いtaskにworkerをassignする
      const lastIndex = tasks.length - 1;
      tasks[lastIndex].assignWorker(w);
    }
  }
}
