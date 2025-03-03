'use strict';

class Entity {
  constructor() {
    this.pos = new Vector(0, 0);
    this.vel = new Vector(0, 0);
    this.move = new Vector(0, 0);
    this.turn = 0;
    this.a = 0;
    this.moveSpeed = 2.0;
    this.turnSpeed = 2.0;
    this.r = 0.5;
    this.movable = true;
  };
  applyMovement(dt) {
    // Apply Turning
    this.a += this.turn * this.turnSpeed * dt;
    this.a = Vector.normalizeAngle(this.a);
    // Apply Movement
    this.vel = this.move.normalize().rot(this.a).nMul(this.moveSpeed).nMul(dt);
    this.pos = this.pos.vAdd(this.vel);
    this.vel.x = 0.0;
    this.vel.y = 0.0;
  };
};