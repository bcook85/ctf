'use strict';

class State {
  constructor(game) {
    this.game = game;
    this.parent = undefined;
  };
  enter() {
    if (this.game.states.length > 1) {
      this.parent = this.game.states[this.game.states.length - 1];
    }
    this.game.keys.reset();
    this.game.mouse.reset();
    this.game.states.push(this);
  };
  leave() {
    if (this.game.states.length > 1) {
      this.game.keys.reset();
      this.game.mouse.reset();
      this.game.states.pop();
    }
  };
  reset() {
    this.game.keys.reset();
    this.game.mouse.reset();
    while (this.game.states.length > 1) {
      this.game.states.pop();
    }
  };
  update(dt) {};
  render(ctx) {};
};
