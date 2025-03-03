'use strict';

// Digital Differential Analysis
function dda(pos, angle, isBlocked, maxDistance) {
  let px = pos.x;
  let py = pos.y;
  let vx = Math.cos(angle);
  let vy = Math.sin(angle);
  let dx = Math.abs(1 / vx);
  let dy = Math.abs(1 / vy);
  let ox = 0;
  let oy = 0;
  let ix = 0;
  let iy = 0;
  if (vx > 0) {
    ix = 1;
    ox = (Math.floor(px) - px + 1) / vx;
  } else {
    ix = -1;
    ox = Math.abs((px - Math.floor(px)) / vx);
  }
  if (vy > 0) {
    iy = 1;
    oy = (Math.floor(py) - py + 1) / vy;
  } else {
    iy = -1;
    oy = Math.abs((py - Math.floor(py)) / vy);
  }
  let travelDistance = 0;
  while (travelDistance < maxDistance) {
    if (ox < oy) {
      px += ix;
      travelDistance = ox;
      ox += dx;
    } else {
      py += iy;
      travelDistance = oy;
      oy += dy;
    }
    if (isBlocked(px, py)) {
      return travelDistance / maxDistance;
    }
  }
  return 1;
};

function objectCast(pos, angle, circlePos, radius, maxDistance) {
  let distance = pos.getDistance(circlePos);
  if (distance < maxDistance) {
    let nx = pos.x + (Math.cos(angle) * distance);
    let ny = pos.y + (Math.sin(angle) * distance);
    if (circlePos.getDistance(new Vector(nx, ny)) <= radius) {
      return (distance - radius) / maxDistance;
    }
  }
  return 1;
};