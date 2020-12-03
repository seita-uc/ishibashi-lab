import Worker from "./class/worker";
import Evaluator from "./class/evaluator";
import Task from "./class/task";

// reputationは所与
// workerは10人
// 一つのタスクに5人
// 5人の合計値が250を超えないと成功しない

// managerによりreputationが高い順にworkerがtaskにアサインされる
// それぞれの役割ごとにクラスに分ける

// workerの生成
const workers: Worker[] = [];
for (let i = 0; i < 10; i++) {
  const w: Worker = new Worker(i);
  workers.push(w);
}

const workersOrderedByReputation: Worker[] = workers.sort(
  (aw: Worker, bw: Worker) => (aw.reputation < bw.reputation ? 1 : -1)
);

const manager: Worker = new Worker(100);

for (let v = 0; v < 10; v++) {
  const task: Task = new Task(0, manager);

  for (let i = 0; i < 5; i++) {
    task.assignWorker(workersOrderedByReputation[i]);
  }

  console.log(workers);
  console.log(task);
  console.log(task.isCompleted());

  const evaluator: Evaluator = new Evaluator(99);
  evaluator.evaluate(task);

  console.log(task);
  console.log(workers);

  // taskの成否によってreputationが増減する
  // taskが失敗 => reputation - 5
  // taskが成功した場合はevaluatorがworkerのpotentialの近似値によって評価する
  // reputation + (potentialの近似値/10)
  // 近似率から値を求める => 方法は?
}
