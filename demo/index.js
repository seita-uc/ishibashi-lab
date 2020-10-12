(async () => {
  console.log("simulation started");

  const role = {
    Manager: 1,
    Evaluator: 1,
    Worker: 2,
  };
  const manager = {
    role: role.Manager,
    points: 0,
  };
  const evaluator = {
    role: role.Evaluator,
    points: 0,
  };
  const worker = {
    role: role.Worker,
    points: 0,
  };

  // 三段階評価
  const evaluation = {
    Unknown: 0,
    Unsatisfactory: 1,
    Satisfactory: 2,
    Excellent: 3,
  };
  const taskStatus = {
    Created: 0,
    InProgress: 1,
    InReview: 2,
    Completed: 3,
    Pending: 4,
  };
  const task = {
    description: "demo task",
    reward: {
      worker: 100,
      evaluator: 50,
    },
    evaluation: evaluation.Unknown,
    status: taskStatus.Created,
  };

  // managerがtaskを作る
  console.log("task created: ", task);

  task.status = taskStatus.InProgress;
  console.log("task in progress: ", task);

  task.status = taskStatus.InReview;
  console.log("task submitted: ", task);

  task.status = taskStatus.Completed;
  console.log("task completed: ", task);

  // TODO taskに給与も設定する
  // taskをworkerが提出して
  // evaluatorが評価して evaluator => worker
  // workerがmanagerを評価して worker => manager
  // managerがcompleteにする
  //
  // completeにした時点で給与が評価に従って支払われるがのちに時価総額を加味した金額にする
  // そうすることでevaluatorの評価にのみ左右されずにすむ

  console.log("simulation done");
})();
