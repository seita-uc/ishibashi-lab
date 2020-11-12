// ポテンシャルの 高い人がpoint上がりやすく結果的にreputationもあがる
const worker_1 = {
  potential: 90,
  reputation: 0,
  value: 90, // 社内市場での時価総額
};
const worker_2 = {
  potential: 70,
  reputation: 0,
  value: 60,
};
const worker_3 = {
  potential: 50,
  reputation: 0,
  value: 30,
};

function getRandomNum(max) {
  return Math.random() * max;
}

function getTaskProgress(potential) {
  return potential * getRandomNum(1.5);
}

const taskStatus = {
  Created: "created",
  InProgress: "in progress",
  Completed: "completed",
  Failed: "failed ",
};

function getTaskStatus(progress) {
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

function getBaseReputationScore(value) {
  if (value > 80) {
    return 10;
  }
  if (value > 60) {
    return 8;
  }
  if (value > 40) {
    return 6;
  }
  if (value > 20) {
    return 4;
  }
  return 2;
}

function evaluate(worker, status) {
  if (status != taskStatus.Completed) {
    return;
  }
  const reputation = getBaseReputationScore(worker.value) + getRandomNum(100);

  // 成功したらreputationを付与する
  worker.reputation += reputation;
}

function simulateTaskFlow() {
  for (const worker of [worker_1, worker_2, worker_3]) {
    const progress = getTaskProgress(worker.potential);
    const status = getTaskStatus(progress);
    evaluate(worker, status);
  }
}

// reputationの高い人が優先的にtaskにアサインされる
(async () => {
  for (let i = 0; i < 100; i++) {
    simulateTaskFlow();
    console.log(
      `${worker_1.reputation},${worker_2.reputation},${worker_3.reputation}`
    );
  }
})();
