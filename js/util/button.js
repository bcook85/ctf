'use strict';

class Button {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.r = this.x + this.w;
    this.b = this.y + this.h;
    this.isHover = false;
    this.isClick = false;
    this.backgroundColor = "rgb(20,20,20)";
    this.backgroundHoverColor = "rgb(80,80,80)";
    this.borderColor = "rgb(120,120,120)";
    this.borderHoverColor = "rgb(255,255,255)";
    this.textColor = "rgb(120,120,120)";
    this.textHoverColor = "rgb(255,255,255)";
    this.font = "bold 18px Monospace";
  };
  update(mouse) {
    this.isHover = false;
    this.isClick = false;
    if (mouse.x < this.x) { return; }
    if (mouse.y < this.y) { return; }
    if (mouse.x > this.r) { return; }
    if (mouse.y > this.b) { return; }
    this.isHover = true;
    if (mouse.isUp("left")) {
      this.isClick = true;
    }
  };
  render(ctx, text) {
    // Background
    ctx.fillStyle = this.isHover ? this.backgroundHoverColor : this.backgroundColor;
    ctx.fillRect(this.x, this.y, this.w, this.h);
    // Border
    ctx.strokeStyle = this.isHover ? this.borderHoverColor : this.borderColor;
    ctx.lineWidth = "2";
    ctx.beginPath();
    ctx.rect(this.x, this.y, this.w, this.h);
    ctx.stroke();
    // Text
    ctx.font = this.font;
    ctx.fillStyle = this.isHover ? this.textHoverColor : this.textColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, this.x + Math.floor(this.w * 0.5), this.y + Math.floor(this.h * 0.5));
  };
};