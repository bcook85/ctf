'use strict'

class Flag extends Entity {
  constructor(homePosition) {
    super();
    this.r = 0.35;
    this.atHome = 1;
    this.isCarried = 0;
    this.carrier = undefined;
    this.resetTimer = new Timer(10);
    this.homePos = homePosition.copy();
    this.pos = homePosition.copy();
  };
  reset() {
    this.resetTimer.reset();
    this.atHome = 1;
    this.isCarried = 0;
    this.carrier = undefined;
    this.pos = this.homePos.copy();
  };
};