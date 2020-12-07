import Worker from "./worker";
import Task from "./task";

export default class Manager extends Worker {
  constructor(id: number) {
    super(id, 100);
  }

  // value高い順に交互に振り分ける
  assignWorkersToTasks(workers: Worker[], tasks: Task[]) {
    if (tasks.length === 0) {
      throw "tasks must not be empty";
    }
    // valueの高い順にworkerをsortする
    for (const w of workers.sort((aw: Worker, bw: Worker) =>
      aw.value < bw.value ? 1 : -1
    )) {
      tasks.sort((at: Task, bt: Task) =>
        at.getValueSum() < bt.getValueSum() ? 1 : -1
      );
      // 一番valueの合計値が低いtaskにworkerをassignする
      const lastIndex = tasks.length - 1;
      tasks[lastIndex].assignWorker(w);
    }
  }
}