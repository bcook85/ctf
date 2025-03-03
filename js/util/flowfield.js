'use strict';

class FlowField {
  constructor(w, h, targetX, targetY, isObject, isWall) {
    this.w = w;
    this.h = h;
    this.grid = [];
    this.neighborsDirect = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    this.neighborsAll = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, 1], [1, 1], [1, -1], [-1, -1]];
    let fx = Math.floor(targetX);
    let fy = Math.floor(targetY);
    for (let x = 0; x < this.w; x++) {
      let col = [];
      for (let y = 0; y < this.h; y++) {
        col.push({
          "dx": undefined,
          "dy": undefined,
          "dist": undefined,
          "wall": isWall(x, y) || isObject(x, y),
          "angle": undefined
        });
      }
      this.grid.push(col);
    }
    // Init Start Position
    this.grid[fx][fy].dist = 0;
    // Calculate Distances
    let toCheck = [[fx, fy]];
    while (toCheck.length > 0) {
      let c = toCheck.shift();
      let cx = c[0];
      let cy = c[1];
      for (let i = 0; i < this.neighborsDirect.length; i++) {
        let x = cx + this.neighborsDirect[i][0];
        let y = cy + this.neighborsDirect[i][1];
        if (!this.grid[x][y].wall) {
          if (this.grid[x][y].dist == undefined) {
            this.grid[x][y].dist = this.grid[cx][cy].dist + 1;
            toCheck.push([x, y]);
          }
        }
      }
    }
    // Calculate Angles
    for (let x = 0; x < this.w; x++) {
      for (let y = 0; y < this.h; y++) {
        if (this.grid[x][y].dist != undefined) {
          let dist = this.grid[x][y].dist;
          for (let i = 0; i < this.neighborsAll.length; i++) {
            let nx = this.neighborsAll[i][0];
            let ny = this.neighborsAll[i][1];
            let cx = x + nx;
            let cy = y + ny;
            if (!this.grid[x][y].wall) {
              let d = this.grid[cx][cy].dist;
              if (d < dist) {
                dist = d;
                this.grid[x][y].dx = nx;
                this.grid[x][y].dy = ny;
                this.grid[x][y].angle = (Math.atan2(ny, nx) + (Math.PI * 2)) % (Math.PI * 2);
              }
            }
          }
        }
      }
    }
  };
  inBounds(x, y) {
    if (x === NaN || y === NaN) {
      return false;
    }
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) {
      return false;
    }
    return true;
  };
  getDistance(x, y) {
    if (!this.inBounds(x, y)) {
      return undefined;
    }
    return this.grid[Math.floor(x)][Math.floor(y)].dist;
  };
  getAngle(x, y) {
    if (!this.inBounds(x, y)) {
      return undefined;
    }
    return this.grid[Math.floor(x)][Math.floor(y)].angle;
  };
};