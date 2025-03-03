'use strict';

class Timer {
  constructor(seconds) {
    this.endCount = seconds;
    this.count = 0;
    this.done = false;
  };
  tick(dt) {
    this.count += dt;
    if (this.count >= this.endCount) {
      this.done = true;
    }
  };
  getProgress() {
    return Math.max(0.0, Math.min(1.0, this.count / this.endCount));
  };
  getRemainder() {
    return Math.abs(this.count - this.endCount);
  };
  isDone() {
    return this.done;
  };
  reset() {
    this.count = 0;
    this.done = false;
  };
};