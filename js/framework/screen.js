'use strict';

class Screen {
  static SCALING = {
    "none": 0,
    "integer": 1,
    "aspectRatio": 2
  };
  constructor(canvas, scaling) {
    this.canvas = canvas;
    this.width = canvas.width;
    this.height = canvas.height;
    // Stop default actions
    this.canvas.oncontextmenu = () => { return false; };
    this.canvas.onselectstart = () => { return false; };
    // Automatically re-size game canvas
    if (scaling == Screen.SCALING.integer) {
      window.addEventListener("resize", () => { this.screenScaleInteger(); }, false);
      window.addEventListener("orientationchange", () => { this.screenScaleInteger(); }, false);
      this.screenScaleInteger();
    } else if (scaling == Screen.SCALING.aspectRatio) {
      window.addEventListener("resize", () => { this.screenScaleStretch(); }, false);
      window.addEventListener("orientationchange", () => { this.screenScaleStretch(); }, false);
      this.screenScaleStretch();
    }
    this.ctx = this.canvas.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;
  };
  screenScaleStretch() {
    let newWidth = Math.floor(window.innerWidth);
    let newHeight = Math.floor(window.innerHeight);
    let aspectRatio = this.canvas.width / this.canvas.height;
    if (newWidth / newHeight > aspectRatio) {//wide
      newWidth = Math.floor(newHeight * aspectRatio);
      this.canvas.style.height = `${newHeight}px`;
      this.canvas.style.width = `${newWidth}px`;
    }
    else {//tall
      newHeight = Math.floor(newWidth / aspectRatio);
      this.canvas.style.width = `${newWidth}px`;
      this.canvas.style.height = `${newHeight}px`;
    }
  };
  screenScaleInteger() {
    let widthRatio = Math.floor(window.innerWidth / this.width);
    let heightRatio = Math.floor(window.innerHeight / this.height);
    let integerScale = Math.max(1, Math.min(widthRatio, heightRatio));
    let newWidth = integerScale * this.width;
    let newHeight = integerScale * this.height;
    this.canvas.style.width = `${newWidth}px`;
    this.canvas.style.height = `${newHeight}px`;
  };
};
