'use strict';

class Bullet extends Entity {
  constructor() {
    super();
    this.owner = undefined;
    this.alive = true;
    this.r = 0.25;
    this.moveSpeed = 50.0;
    this.damage = 20;
    this.lifeTimer = new Timer(0.35);
    this.move.x = 1;
  };
};
