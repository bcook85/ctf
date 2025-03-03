'use strict';

class Projector {
  static twoPI = Math.PI * 2;
  constructor(width, height, fieldOfView, wallSprites) {
    // Camera Position in World
    this.x = 0;
    this.y = 0;
    this.a = 0;
    // Screen Size
    this.width = width;
    this.height = height;
    this.halfWidth = this.width * 0.5;
    this.halfHeight = this.height * 0.5;
    // Set Viewport Options
    this.fov = fieldOfView * Math.PI / 180;
    this.halfFov = this.fov * 0.5;
    this.objectFov = this.fov * 0.75; // ProjectEntity: to prevent pop in/out at edges
    this.wallHeight = Math.abs(Math.floor(this.halfWidth / Math.tan(this.halfFov)));
    this.wallHeightHalf = this.wallHeight * 0.5;
    this.viewDistance = 32;
    this.shadowScale = 0.75;// distance affects brightness
    // Drawable Objects
    this.wallSprites = wallSprites;
    this.walls = [];
    this.objects = [];
  };
  set(x, y, a) {
    this.x = x;
    this.y = y;
    this.a = a;
  };
  drawBackgroundColors(ctx, skyColor, floorColor) {
    ctx.fillStyle = skyColor;
    ctx.fillRect(0, 0, this.width, this.halfHeight);
    ctx.fillStyle = floorColor;
    ctx.fillRect(0, this.halfHeight, this.width, this.halfHeight);
  };
  drawBackgroundStatic(ctx, image) {
    ctx.drawImage(
      image,
      0,
      0,
      image.width,
      image.height,
      0,
      0,
      this.width,
      this.height
    )
  };
  drawBackgroundScrolling(ctx, image) {};
  projectWalls(isBlocked, getSprite) {
    for (let i = 0; i < this.width; i++) {
      let wall = {
        "distance": Infinity,
        "height": 0,
        "top": 0,
        "tile": undefined,
        "xTexture": 0,
        "shade": 0
      };
      let x = this.x;
      let y = this.y;
      let ia = (this.a - this.halfFov) + (i / this.width * this.fov);
      if (ia > Projector.twoPI) {
        ia -= Projector.twoPI;
      } else if (ia < 0) {
        ia += Projector.twoPI;
      }
      let vx = Math.cos(ia);
      let vy = Math.sin(ia);
      let fac = Math.cos(ia - this.a);
      let dx = Math.abs(1 / vx);
      let dy = Math.abs(1 / vy);
      let ox = 0;
      let oy = 0;
      let ix = 0;
      let iy = 0;
      if (vx > 0) {
        ix = 1;
        ox = (Math.floor(x) - x + 1) / vx;
      } else {
        ix = -1;
        ox = Math.abs((x - Math.floor(x)) / vx);
      }
      if (vy > 0) {
        iy = 1;
        oy = (Math.floor(y) - y + 1) / vy;
      } else {
        iy = -1;
        oy = Math.abs((y - Math.floor(y)) / vy);
      }
      let travelDistance = 0;
      while (travelDistance < this.viewDistance) {
        let tx = 0;
        if (ox < oy) {
          x += ix;
          travelDistance = ox * fac;
          tx = (this.y + vy * ox) % 1;
          if (!(ia > Math.PI * 1.5 || ia < Math.PI * 0.5)) {
            tx = 1 - tx
          }
          ox += dx;
        } else {
          y += iy;
          travelDistance = oy * fac;
          tx = (this.x + vx * oy) % 1;
          if (!(ia < 0 || ia > Math.PI)) {
            tx = 1 - tx
          }
          oy += dy;
        }
        if (isBlocked(x, y)) {
          let tile = getSprite(x, y);
          if (tile !== undefined) {
            wall.distance = travelDistance;
            wall.height = Math.floor(this.wallHeight / travelDistance);
            wall.top = Math.floor((this.height - wall.height) * 0.5);
            wall.xTexture = tx;
            wall.tile = tile;
            wall.shade = Math.min(1, travelDistance / this.viewDistance * this.shadowScale);
          }
          break;
        }
      }
      this.walls[i] = wall;
    }
  };
  drawWalls(ctx) {
    for (let i = 0; i < this.walls.length; i++) {
      if (this.walls[i].distance < this.viewDistance) {
        let wallImage = this.wallSprites[this.walls[i].tile];
        // Draw Wall Slice
        ctx.drawImage(
          wallImage,
          Math.floor(this.walls[i].xTexture * wallImage.width),
          0,
          1,
          wallImage.height,
          i,
          this.walls[i].top,
          1,
          this.walls[i].height
        );
        // Shade
        ctx.fillStyle = `rgba(0,0,0,${this.walls[i].shade})`;
        ctx.fillRect(
          i,
          this.walls[i].top,
          1,
          this.walls[i].height
        );
      }
    }
  };
  projectEntity(pos, sprite, drawSize, zLevel) {
    // Check for in FOV
    let angleToTarget = Math.atan2(pos[1] - this.y, pos[0] - this.x)
    let a1 = Projector.normalizeAngle(this.a - this.objectFov);
    let a2 = Projector.normalizeAngle(this.a + this.objectFov);
    if (a2 < a1) {
      a1 -= Projector.twoPI;
    } else {
      angleToTarget = Projector.normalizeAngle(angleToTarget);
    }
    if (angleToTarget < a1 || angleToTarget > a2) { return; }
    // Check for maxViewDistance
    let a = angleToTarget - this.a;
    let fac = Math.cos(a);
    let dist = Math.hypot(pos[0] - this.x, pos[1] - this.y) * fac;
    if (dist > this.viewDistance || dist < 0.25) { return; }
    // Calculate projection size & position
    let size = Math.floor(this.wallHeight * drawSize / dist);
    let bottom = Math.floor(this.halfHeight + (this.wallHeightHalf / dist));
    let top = bottom - size - (zLevel * (this.wallHeight / dist));
    let left = Math.floor(this.halfWidth + (Math.tan(a) * this.wallHeight) - (size * 0.5));
    if (!(left < this.width && left + size >= 0)) { return; }
    // Limit drawing area to in front of walls
    let finalLeft = left;
    let finalRight = Math.floor(left + size);
    let leftDraw = Math.max(0, finalLeft);
    let rightDraw = Math.min(this.width - 1, finalRight);
    let slices = [];
    let sliceStart = undefined;
    let sliceWidth = 0;
    for (let j = leftDraw; j <= rightDraw; j++) {
      if (dist >= this.walls[j].distance) {
        if (sliceStart != undefined) {
          if (j - 1 - sliceStart > sliceWidth) {
            slices.push([sliceStart, j - 1]);
            sliceWidth = j - 1 - sliceStart;
            finalLeft = sliceStart;
            finalRight = j - 1;
          }
          sliceStart = undefined;
        }
      } else {
        if (sliceStart == undefined) {
          sliceStart = j;
        }
      }
    }
    if (sliceStart != undefined) {
      slices.push([sliceStart, rightDraw]);
      finalLeft = sliceStart;
      finalRight = rightDraw;
    }
    if (slices.length == 0) { return; }
    // Add entity to draw queue
    let obj = {};
    obj.top = top;
    obj.size = size;
    obj.sprite = sprite;
    obj.left = finalLeft;
    obj.right = finalRight;
    obj.imageL = Math.floor(((finalLeft - left) / size) * sprite.width);
    obj.imageW = Math.ceil(((finalRight - finalLeft) / size) * sprite.width);
    obj.dist = dist;
    for (let i = 0; i < this.objects.length; i++) {
      if (obj.dist > this.objects[i].dist) {
        this.objects.splice(i, 0, obj);
        return;
      }
    }
    this.objects.push(obj);
  };
  drawEntities(ctx) {
    for (let i = 0; i < this.objects.length; i++) {
      let obj = this.objects[i];
      ctx.drawImage(
        obj.sprite,
        obj.imageL,
        0,
        obj.imageW,
        obj.sprite.height,
        Math.floor(obj.left),
        obj.top,
        Math.ceil(obj.right - obj.left),
        obj.size
      );
    }
    this.objects = [];
  };
  static normalizeAngle(angle) {
    let newAngle = angle;
    while (newAngle < 0) {
      newAngle += Projector.twoPI;
    }
    while(newAngle > Projector.twoPI) {
      newAngle -= Projector.twoPI;
    }
    return newAngle;
  };
};
