export default class Worker {
  id: number; //連番
  potential: number; // 1-100の乱数
  reputation: number;

  constructor(id: number, potential: number) {
    this.id = id;
    this.potential = potential;
    this.reputation = 1;
  }
}
