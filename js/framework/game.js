'use strict';

// Application Object
const GAME = {
  "title": document.title,
  "screen": undefined,
  "mouse": {
    "x": 0,
    "y": 0,
    "lastX": 0,
    "lastY": 0,
    "buttons": {
      "left": {
        "isDown": false,
        "isUp": false
      },
      "middle": {
        "isDown": false,
        "isUp": false
      },
      "right": {
        "isDown": false,
        "isUp": false
      },
      "wheel": {
        "isDown": false,
        "isUp": false,
      }
    },
    isDown(button) {
      return GAME.mouse.buttons[button].isDown;
    },
    isUp(button) {
      return GAME.mouse.buttons[button].isUp;
    },
    reset() {
      GAME.mouse.buttons.left.isUp = false;
      GAME.mouse.buttons.middle.isUp = false;
      GAME.mouse.buttons.right.isUp = false;
      GAME.mouse.buttons.wheel.isUp = false;
      GAME.mouse.buttons.wheel.isDown = false;
    }
  },
  "keys": {
    "pressed": [],
    "released": [],
    isDown(key) {
      return GAME.keys.pressed[key];
    },
    isUp(key) {
      return GAME.keys.released[key];
    },
    reset() {
      GAME.keys.released = {};
    }
  },
  "images": [],
  "sounds": [],
  "states": [],
  isLoaded() {
    for (let i = 0; i < GAME.images.length; i++) {
      if (!GAME.images[i].loaded) return false;
    }
    for (let i = 0; i < GAME.sounds.length; i++) {
      if (!GAME.sounds[i].loaded) return false;
    }
    return true;
  },
  loadImage(filePath) {
    let ia = new ImageAsset(filePath);
    GAME.images.push(ia);
    return ia;
  },
  loadSound(filePath) {
    let sa = new SoundAsset(filePath);
    GAME.sounds.push(sa);
    return sa;
  },
  start(canvasElement, scalingOption, startState) {
    // Init Screen
    GAME.screen = new Screen(canvasElement, scalingOption);
    // Init Mouse
    GAME.screen.canvas.addEventListener(
      "mousemove", (e) => {
        GAME.mouse.lastX = GAME.mouse.x;
        GAME.mouse.lastY = GAME.mouse.y;
        let canvasRect = canvasElement.getBoundingClientRect();
        let scaleX = canvasElement.width / canvasRect.width;
        let scaleY = canvasElement.height / canvasRect.height;
        GAME.mouse.x = Math.min(Math.max(Math.floor((e.clientX - canvasRect.left) * scaleX), 0), canvasElement.width);
        GAME.mouse.y = Math.min(Math.max(Math.floor((e.clientY - canvasRect.top) * scaleY), 0), canvasElement.height);
      },false
    );
    GAME.screen.canvas.addEventListener(
      "mousedown", (e) => {
        e.preventDefault();
        if (e.button === 0) {
          GAME.mouse.buttons.left.isDown = true;
          GAME.mouse.buttons.left.isUp = false;
        } else if (e.button === 1) {
          GAME.mouse.buttons.middle.isDown = true;
          GAME.mouse.buttons.middle.isUp = false;
        } else if (e.button === 2) {
          GAME.mouse.buttons.right.isDown = true;
          GAME.mouse.buttons.right.isUp = false;
        }
      },false
    );
    GAME.screen.canvas.addEventListener(
      "mouseup", (e) => {
        e.preventDefault();
        if (e.button === 0) {
          GAME.mouse.buttons.left.isDown = false;
          GAME.mouse.buttons.left.isUp = true;
        } else if (e.button === 1) {
          GAME.mouse.buttons.middle.isDown = false;
          GAME.mouse.buttons.middle.isUp = true;
        } else if (e.button === 2) {
          GAME.mouse.buttons.right.isDown = false;
          GAME.mouse.buttons.right.isUp = true;
        }
      },false
    );
    GAME.screen.canvas.addEventListener(
      "wheel", (e) => {
        e.preventDefault();
        if (e.deltaY > 0) {
          GAME.mouse.buttons.wheel.isDown = true;
          GAME.mouse.buttons.wheel.isUp = false;
        } else if (e.deltaY < 0) {
          GAME.mouse.buttons.wheel.isDown = false;
          GAME.mouse.buttons.wheel.isUp = true;
        }
      },false
    );
    // Init Keyboard
    window.addEventListener(
      "keydown", (e) => {
        GAME.keys.pressed[e.code] = true;
      },false
    );
    window.addEventListener(
      "keyup", (e) => {
        delete GAME.keys.pressed[e.code];
        GAME.keys.released[e.code] = true;
      },false
    );
    // FPS & Timing
    let now = performance.now();
    let last = now;
    let elapsed = 0;
    let deltaTime = 0;
    let animationFrameId = 0;
    let ts = 0;
    let fpsFrame = 0;
    let fpsTime = 0;
    let fpsMin = 15;
    let maxFrameTime = 1000 / fpsMin;
    // Load Loop
    function loadLoop(ts) {
      GAME.screen.ctx.fillStyle = "rgb(0,0,0)";
      GAME.screen.ctx.fillRect(0, 0, GAME.screen.width, GAME.screen.height);
      GAME.screen.ctx.font = `bold ${Math.floor(GAME.screen.width * 0.1)}px Monospace`;
      GAME.screen.ctx.fillStyle = "rgb(255,0,0)";
      GAME.screen.ctx.textAlign = "center";
      GAME.screen.ctx.textBaseline = "middle";
      GAME.screen.ctx.fillText(
        "LOADING..."
        ,Math.floor(GAME.screen.width * 0.5)
        ,Math.floor(GAME.screen.height * 0.5)
      );
      if (GAME.isLoaded()) {
        new startState(GAME).enter();
        animationFrameId = requestAnimationFrame((ts) => runLoop(ts));
      } else {
        animationFrameId = requestAnimationFrame((ts) => loadLoop(ts));
      }
    };
    // Game Loop
    function runLoop(ts) {
      // Re-Loop
      animationFrameId = requestAnimationFrame((ts) => runLoop(ts));
      // Timing
      now = ts;
      elapsed = now - last;
      last = now;
      deltaTime = Math.min(maxFrameTime, elapsed) * 0.001;
      // FPS
      fpsFrame += 1;
      fpsTime += elapsed;
      if (fpsFrame >= 60) {
        document.title = `${GAME.title} - ${Math.round(1000 / fpsTime * fpsFrame)}fps`;
        fpsFrame = 0;
        fpsTime = 0;
      }
      // Update
      GAME.states[GAME.states.length - 1].update(deltaTime);
      // Render
      GAME.states[GAME.states.length - 1].render(GAME.screen.ctx);
      // Reset
      GAME.keys.reset();
      GAME.mouse.reset();
    };
    // Start Loop
    animationFrameId = requestAnimationFrame((ts) => loadLoop(ts));
  }
};
