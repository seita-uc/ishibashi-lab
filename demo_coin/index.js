// ポテンシャルの 高い人がpoint上がりやすく結果的にreputationもあがる
const worker_1 = {
  potential: 90,
  reputation: 0,
  value: 0, // 社内市場での時価総額
};
const worker_2 = {
  potential: 60,
  reputation: 0,
  value: 0,
};
const worker_3 = {
  potential: 30,
  reputation: 0,
  value: 0,
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

// reputationの高い人が優先的にtaskにアサインされる
(async () => {
  for (const worker of [worker_1, worker_2, worker_3]) {
    const progress = getTaskProgress(worker.potential);
    const status = getTaskStatus(progress);
    console.log(progress);
    console.log(status);
  }
})();
