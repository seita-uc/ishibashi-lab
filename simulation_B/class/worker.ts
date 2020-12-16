import { getRandomInt } from "../util/util";

export default class Worker {
  id: number; //連番
  potential: number; // 1-100の乱数
  perceivedPotentials: Map<number, number> = new Map<number, number>();

  // TODO coinの概念を導入する
  constructor(id: number) {
    this.id = id;
    this.potential = getRandomInt(10, 100);
  }

  setPerceivedPotential(workerId: number, potential: number) {
    this.perceivedPotentials.set(workerId, potential);
  }

  initializePerceivedPotentials(workers: Worker[]) {
    for (const w of workers) {
      if (this.id == w.id) {
        continue;
      }
      const pp = getRandomInt(1, 100);
      this.setPerceivedPotential(w.id, pp);
    }
  }
}
