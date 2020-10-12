(async () => {
  console.log("simulation started\n");

  const role = {
    Manager: "manager",
    Evaluator: "evaluator",
    Worker: "worker",
  };
  const manager = {
    reputation: 0,
    role: role.Manager,
    points: 0,
  };
  const evaluator = {
    reputation: 0,
    role: role.Evaluator,
    points: 0,
  };
  const worker = {
    reputation: 0,
    role: role.Worker,
    points: 0,
  };

  // 三段階評価
  const evaluation = {
    Unknown: "unknown",
    Unsatisfactory: "unsatisfactory",
    Satisfactory: "satisfactory",
    Excellent: "excellent",
  };
  const taskStatus = {
    Created: "created",
    InProgress: "in progress",
    InReview: "in review",
    Completed: "completed",
    Pending: "pending ",
  };
  const task = {
    description: "demo task",
    // task終了時の給料
    payouts: {
      manager: 100,
      worker: 70,
      evaluator: 50,
    },
    evaluation: {
      worker: evaluation.Unknown,
      manager: evaluation.Unknown,
    },
    status: taskStatus.Created,
  };

  // managerがtaskを作る
  console.log("task created: ", task);

  task.status = taskStatus.InProgress;
  console.log("task in progress: ", task);

  task.status = taskStatus.InReview;
  console.log("task submitted: ", task);

  task.evaluation.worker = evaluation.Satisfactory;
  console.log("evaluator evaluated task: ", task);

  task.evaluation.manager = evaluation.Satisfactory;
  console.log("worker evaluated manager: ", manager);

  task.status = taskStatus.Completed;
  console.log("task completed: ", task);

  // evaluationに応じてreputationが変動する
  if (task.status == taskStatus.Completed) {
    // workerのretupation反映
    switch (task.evaluation.worker) {
      case evaluation.Unsatisfactory:
        worker.reputation -= task.payouts.worker;
        break;
      case evaluation.Satisfactory:
        worker.reputation += task.payouts.worker;
        break;
      case evaluation.Excellent:
        worker.reputation += task.payouts.worker * 1.5;
        break;
      default:
    }

    // managerのretupation反映
    switch (task.evaluation.manager) {
      case evaluation.Unsatisfactory:
        manager.reputation -= task.payouts.manager;
        break;
      case evaluation.Satisfactory:
        manager.reputation += task.payouts.manager;
        break;
      case evaluation.Excellent:
        manager.reputation += task.payouts.manager * 1.5;
        break;
      default:
    }

    // 全員のpayout実施
    worker.points += task.payouts.worker;
    manager.points += task.payouts.manager;
    evaluator.points += task.payouts.evaluator;
  }

  console.log("\n------result------\n");
  console.log("worker: ", worker);
  console.log("manager: ", manager);
  console.log("evaluator: ", evaluator);

  // completeにした時点で給与が評価に従って支払われるがのちに時価総額を加味した金額にする
  // そうすることでevaluatorの評価にのみ左右されずにすむ

  console.log("\nsimulation done");
})();
