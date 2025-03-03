'use strict';

class Player extends Entity {
  constructor(respawnPosition) {
    super();
    this.id = undefined;
    this.alive = true;
    this.maxHealth = 100;
    this.hp = this.maxHealth;
    this.moveSpeed = 6.0;
    this.turnSpeed = 7.0;
    this.fire = 0;
    this.lastFire = 0;
    this.fireTimer = new Timer(0.33);
    this.respawnTimer = new Timer(5);
    this.respawnPosition = respawnPosition.copy();
    this.pos = respawnPosition.copy();
    this.pos.x += (Math.random() - 0.5) * this.r;
    this.pos.y += (Math.random() - 0.5) * this.r;
    this.isCarrying = 0;
    this.shots = 0;
    this.hits = 0;
    this.captures = 0;
    this.returns = 0;
    this.pickups = 0;
    this.kills = 0;
    this.visited = [];
    this.vision = [];
    this.memory = 0.5;
  };
  respawn() {
    this.alive = true;
    this.hp = this.maxHealth;
    this.fire = 0;
    this.lastFire = 0;
    this.fireTimer.reset();
    this.isCarrying = 0;
    this.respawnTimer.reset();
    this.pos = this.respawnPosition.copy();
    this.pos.x += (Math.random() - 0.5) * this.r;
    this.pos.y += (Math.random() - 0.5) * this.r;
  };
  reset() {
    this.alive = true;
    this.hp = this.maxHealth;
    this.fire = 0;
    this.lastFire = 0;
    this.fireTimer.reset();
    this.isCarrying = 0;
    this.shots = 0;
    this.hits = 0;
    this.captures = 0;
    this.returns = 0;
    this.pickups = 0;
    this.kills = 0;
    this.visited = [];
    this.vision = [];
    this.memory = 0.5;
    this.respawnTimer.reset();
    this.pos = this.respawnPosition.copy();
    this.pos.x += (Math.random() - 0.5) * this.r;
    this.pos.y += (Math.random() - 0.5) * this.r;
  };
  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount);
    if (this.hp == 0) {
      this.alive = false;
      this.respawnTimer.reset();
    }
  };
};