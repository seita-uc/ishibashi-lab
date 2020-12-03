import { getRandomInt } from "../util/util";

export default class Worker {
  id: number; //連番
  potential: number; // 1-100の乱数
  reputation: number;

  constructor(id: number) {
    this.id = id;
    this.potential = getRandomInt(100);
    this.reputation = getRandomInt(100);
  }
}
