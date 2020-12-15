import { getRandomInt } from "../util/util";

export default class Worker {
  id: number; //連番
  potential: number; // 1-100の乱数
  value: number;
  perceivedPotentials: Map<number, number> = new Map<number, number>();

  // TODO coinの概念を導入する
  constructor(id: number, potential: number) {
    this.id = id;
    this.potential = potential;
    this.value = getRandomInt(10, 100);
  }

  setPerceivedPotential(workerId: number, potential: number) {
    this.perceivedPotentials.set(workerId, potential);
  }
}
