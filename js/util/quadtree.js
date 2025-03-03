'use strict';

class QuadTree {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.capacity = 4;
    this.entities = [];
    this.divided = false;
    this.nw = undefined;
    this.ne = undefined;
    this.sw = undefined;
    this.se = undefined;
  };
  inBounds(x, y) {
    if (x < this.x) return false;
    if (y < this.y) return false;
    if (x >= this.x + this.width) return false;
    if (y >= this.y + this.height) return false;
    return true;
  };
  intersects(x, y, r) {
    if (x + r < this.x) return false;
    if (x - r > this.x + this.width) return false;
    if (y + r < this.y) return false;
    if (y - r > this.y + this.height) return false;
    return true;
  };
  addEntity(x, y, i) {
    if (this.entities.length < this.capacity) {
      if (this.inBounds(x, y)) {
        this.entities.push([x, y, i]);
        return true;
      }
      return false;
    }
    this.divide();
    if (this.nw.addEntity(x, y, i)) return true;
    if (this.ne.addEntity(x, y, i)) return true;
    if (this.sw.addEntity(x, y, i)) return true;
    if (this.se.addEntity(x, y, i)) return true;
    return false;
  };
  divide() {
    if (!this.divided) {
      this.divided = true;
      let width = this.width * 0.5;
      let height = this.height * 0.5;
      this.nw = new QuadTree(this.x, this.y, width, height);
      this.ne = new QuadTree(this.x + width, this.y, width, height);
      this.sw = new QuadTree(this.x, this.y + height, width, height);
      this.se = new QuadTree(this.x + width, this.y + height, width, height);
    }
  };
  query(x, y, r, list) {
    if (this.intersects(x, y, r)) {
      let pos = new Vector(x, y);
      for (let i = 0; i < this.entities.length; i++) {
        list.push(this.entities[i][2]);
      }
      if (this.divided) {
        list = this.nw.query(x, y, r, list);
        list = this.ne.query(x, y, r, list);
        list = this.sw.query(x, y, r, list);
        list = this.se.query(x, y, r, list);
      }
    }
    return list;
  };
  render(ctx, scale, xOffset, yOffset) {
    ctx.beginPath();
    ctx.lineWidth = "1";
    ctx.strokeStyle = "white";
    ctx.rect(
      (this.x * scale) - xOffset,
      (this.y * scale) - yOffset,
      (this.width * scale),
      (this.height * scale)
    );
    ctx.stroke();
    if (this.divided) {
      this.nw.render(ctx, scale, xOffset, yOffset);
      this.ne.render(ctx, scale, xOffset, yOffset);
      this.sw.render(ctx, scale, xOffset, yOffset);
      this.se.render(ctx, scale, xOffset, yOffset);
    }
  };
};
