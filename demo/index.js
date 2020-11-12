// taskのprogressの指標
// workerのpotential*乱数でprogressが進む

function getRandomNum(max) {
  return Math.random() * max;
}
const role = {
  Manager: "manager",
  Evaluator: "evaluator",
  Worker: "worker",
};
// potentialを仮置き
const potential = {
  High: 90,
  Middle: 70,
  Low: 50,
};
const manager = {
  reputation: 0,
  role: role.Manager,
  points: 0,
};
const workerPotentialHigh = {
  reputation: 0,
  role: role.Worker,
  points: 0,
  potential: potential.High,
};
const workerPotentialMiddle = {
  reputation: 0,
  role: role.Worker,
  points: 0,
  potential: potential.Middle,
};
const workerPotentialLow = {
  reputation: 0,
  role: role.Worker,
  points: 0,
  potential: potential.Low,
};
// workerのpotential*乱数で

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
  Failed: "failed ",
};

function getTaskStatus(progress) {
  console.log(progress > 80);
  if (progress > 70) {
    return taskStatus.Completed;
  }
  if (progress > 0) {
    return taskStatus.Failed;
  }
  if (progress == 0) {
    return taskStatus.Created;
  }
  return taskStatus.Failed;
}

function getTaskProgress(potential) {
  return potential * getRandomNum(1.5);
}

(async () => {
  //console.log("simulation started\n");

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
    progress: 0,
  };

  // managerがtaskを作る
  //task.progress = getTaskProgress(workerPotentialHigh.potential);

  // completeにした時点で給与が評価に従って支払われるがのちに時価総額を加味した金額にする
  // reputationを時価総額に加味した形にするか
  // TODO どうやってポテンシャル評価をするのか
  // TODO 各人のポテンシャルをあらかじめ与えておいてreputationが上昇+給与が上昇する仕組みにするか
  // そうすることでevaluatorの評価にのみ左右されずにすむ

  for (let i = 0; i < 100; i++) {
    const progress1 = getTaskProgress(workerPotentialHigh.potential);
    const progress2 = getTaskProgress(workerPotentialMiddle.potential);
    const progress3 = getTaskProgress(workerPotentialLow.potential);
    console.log(`${progress1},${progress2},${progress3}`);
  }

  // TODO taskのevaluationによるreputationの付与・評価
  // TODO reputation・potentialに基づいたチーム編成
  // TODO タスク実行

  function payout(worker, task) {
    const payout = task.payout[worker.role];
    switch (task.evaluation.manager) {
      case evaluation.Unsatisfactory:
        worker.reputation -= payout;
        break;
      case evaluation.Satisfactory:
        worker.reputation += payout;
        break;
      case evaluation.Excellent:
        worker.reputation += payout * 1.5;
        break;
      default:
    }
    worker.points += payout;
  }
})();
