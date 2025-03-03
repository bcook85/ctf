'use strict';

class TrainState extends State {
  constructor(game) {
    super(game);
    // Game State object
    this.gameState = new GameState(this);
    // GFX
    this.drawScale = this.gameState.map.drawScale;
    this.gameScreenOffset = Math.floor((360 - (this.gameState.map.w * this.drawScale)) * 0.5);
    this.mapImage = this.gameState.map.getMapImage(undefined);
    this.showVision = false;
    // UI Buttons
    this.buttonY = this.game.screen.height - 64;
    this.buttonWidth = 32;
    this.buttonHeight = 32;
    this.menuButton = new Button(
      360 + 40,
      this.buttonY,
      64,
      this.buttonHeight
    );
    this.slowerButton = new Button(
      this.menuButton.r + 48,
      this.buttonY,
      this.buttonWidth,
      this.buttonHeight
    );
    this.fasterButton = new Button(
      this.slowerButton.r + 24,
      this.buttonY,
      this.buttonWidth,
      this.buttonHeight
    );
  };
  update(dt) {
    this.playerControls();
    this.gameState.update(dt);
  };
  playerControls() {
    // Button Updates
    this.menuButton.update(this.game.mouse);
    this.slowerButton.update(this.game.mouse);
    this.fasterButton.update(this.game.mouse);
    // Controls
    if (this.game.keys.isUp("Escape") || this.menuButton.isClick) {
      new PauseState(this.game).enter();
      return;
    }
    if (this.game.keys.isUp("ArrowRight") || this.fasterButton.isClick) {
      this.gameState.gameSpeed = Math.min(10, this.gameState.gameSpeed + 1);
    }
    if (this.game.keys.isUp("ArrowLeft") || this.slowerButton.isClick) {
      this.gameState.gameSpeed = Math.max(0, this.gameState.gameSpeed - 1);
    }
    if (this.game.keys.isUp("Space")) {
      this.showVision = !this.showVision;
    }
  };
  render(ctx) {// Background
    ctx.fillStyle = COLORS.black;
    ctx.fillRect(0, 0, this.game.screen.width, this.game.screen.height);
    ctx.translate(this.gameScreenOffset, this.gameScreenOffset);
    // Map
    ctx.drawImage(this.mapImage, 0, 0, this.mapImage.width, this.mapImage.height);
    // Players
    for (let i = 0; i < this.gameState.redTeam.players.length; i++) {
      if (this.gameState.redTeam.players[i].alive) {
        this.drawPlayer(ctx, this.gameState.redTeam.players[i], COLORS.red);
      }
    }
    for (let i = 0; i < this.gameState.blueTeam.players.length; i++ ) {
      if (this.gameState.blueTeam.players[i].alive) {
        this.drawPlayer(ctx, this.gameState.blueTeam.players[i], COLORS.blue);
      }
    }
    // Bullets
    for (let i = 0; i < this.gameState.redTeam.bullets.length; i++) {
      if (this.gameState.redTeam.bullets[i].alive) {
        this.drawBullet(ctx, this.gameState.redTeam.bullets[i], COLORS.red);
      }
    }
    for (let i = 0; i < this.gameState.blueTeam.bullets.length; i++ ) {
      if (this.gameState.blueTeam.bullets[i].alive) {
        this.drawBullet(ctx, this.gameState.blueTeam.bullets[i], COLORS.blue);
      }
    }
    // Flags
    this.drawFlag(ctx, this.gameState.redTeam.flag, COLORS.red);
    this.drawFlag(ctx, this.gameState.blueTeam.flag, COLORS.blue);
    ctx.translate(-this.gameScreenOffset, -this.gameScreenOffset);
    // UI
    this.drawUI(ctx);
  };
  drawPlayer(ctx, player, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(
      Math.floor(player.pos.x * this.drawScale),
      Math.floor(player.pos.y * this.drawScale),
      player.r * this.drawScale,
      0,
      2 * Math.PI
    );
    ctx.fill();
    ctx.strokeStyle = COLORS.white;
    ctx.lineWidth = Math.max(1, Math.floor((this.drawScale * player.r * 0.5) - 1));
    ctx.beginPath();
    ctx.moveTo(
      Math.floor(player.pos.x * this.drawScale),
      Math.floor(player.pos.y * this.drawScale)
    );
    let eye = player.pos.vAdd(new Vector(1, 0).rot(player.a).nMul(player.r));
    ctx.lineTo(
      Math.floor(eye.x * this.drawScale),
      Math.floor(eye.y * this.drawScale)
    );
    ctx.stroke();
    if (player.vision.length > 0 && this.showVision) {
      for (let i = 0; i < this.gameState.nnVision.rays.length; i++) {
        let pos = player.pos.vAdd(new Vector(1, 0).rot(player.a).nMul(player.r));
        let dir = player.a + this.gameState.nnVision.rays[i];
        let dist = player.vision[(i * 2) + 1] * this.gameState.nnVision.maxDistance;
        let color = COLORS.lightGrey;
        switch (player.vision[(i * 2)]) {
          case this.gameState.nnVision.objectTypes.wall:
            color = COLORS.grey;
            break;
          case this.gameState.nnVision.objectTypes.ally:
            color = COLORS.green;
            break;
          case this.gameState.nnVision.objectTypes.enemy:
            color = COLORS.red;
            break;
          case this.gameState.nnVision.objectTypes.allyCarrier:
            color = COLORS.green;
            break;
          case this.gameState.nnVision.objectTypes.enemyCarrier:
            color = COLORS.red;
            break;
          case this.gameState.nnVision.objectTypes.teamFlag:
            color = COLORS.green;
            break;
          case this.gameState.nnVision.objectTypes.enemyFlag:
            color = COLORS.gold;
            break;
          case this.gameState.nnVision.objectTypes.bullet:
            color = COLORS.red;
            break;
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(
          Math.floor(pos.x * this.drawScale),
          Math.floor(pos.y * this.drawScale)
        );
        let end = pos.vAdd(new Vector(1, 0).rot(dir).nMul(dist));
        ctx.lineTo(
          Math.floor(end.x * this.drawScale),
          Math.floor(end.y * this.drawScale)
        );
        ctx.stroke();
      }
    }
  };
  drawBullet(ctx, bullet, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(
      Math.floor(bullet.pos.x * this.drawScale),
      Math.floor(bullet.pos.y * this.drawScale),
      bullet.r * this.drawScale,
      0,
      2 * Math.PI
    );
    ctx.fill();
  };
  drawFlag(ctx, flag, color) {
    ctx.fillStyle = color;
    ctx.strokeStyle = COLORS.white;
    ctx.lineWidth = Math.max(1, Math.floor((this.drawScale * flag.r * 0.5) - 1));
    ctx.beginPath();
    ctx.moveTo(
      Math.floor((flag.pos.x) * this.drawScale),
      Math.floor((flag.pos.y - flag.r) * this.drawScale)
    );
    ctx.lineTo(
      Math.floor((flag.pos.x + flag.r) * this.drawScale),
      Math.floor((flag.pos.y + flag.r) * this.drawScale)
    );
    ctx.lineTo(
      Math.floor((flag.pos.x - flag.r) * this.drawScale),
      Math.floor((flag.pos.y + flag.r) * this.drawScale)
    );
    ctx.lineTo(
      Math.floor((flag.pos.x) * this.drawScale),
      Math.floor((flag.pos.y - flag.r) * this.drawScale)
    );
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(
      Math.floor((flag.pos.x) * this.drawScale),
      Math.floor((flag.pos.y - flag.r) * this.drawScale)
    );
    ctx.lineTo(
      Math.floor((flag.pos.x + flag.r) * this.drawScale),
      Math.floor((flag.pos.y + flag.r) * this.drawScale)
    );
    ctx.lineTo(
      Math.floor((flag.pos.x - flag.r) * this.drawScale),
      Math.floor((flag.pos.y + flag.r) * this.drawScale)
    );
    ctx.lineTo(
      Math.floor((flag.pos.x) * this.drawScale),
      Math.floor((flag.pos.y - flag.r) * this.drawScale)
    );
    ctx.stroke();
  };
  drawUI(ctx) {
    let menuWidth = 280;
    let menuXStart = 360;
    let center = Math.floor(menuWidth * 0.5) + menuXStart;
    let labelY = 24;
    let rowPadding = 20;
    let columnPadding = 48;
    let divider = Math.floor(menuXStart + (menuWidth * 0.675));
    ctx.font = FONTS.medium;
    ctx.fillStyle = COLORS.gold;
    ctx.textBaseline = "middle";
    // Generation
    ctx.textAlign = "right";
    ctx.fillText("Generation: ", divider, labelY);
    ctx.textAlign = "left";
    ctx.fillText(this.gameState.generation, divider, labelY);
    labelY += rowPadding;
    // Brain Index
    let brainGroup = `${Math.floor(this.gameState.brainIndex / this.gameState.maxPlayers) + 1}/${Math.floor(this.gameState.maxBrains / this.gameState.maxPlayers)}`;
    ctx.textAlign = "right";
    ctx.fillText("Brain Group: ", divider, labelY);
    ctx.textAlign = "left";
    ctx.fillText(brainGroup, divider, labelY);
    labelY += rowPadding;
    // Game Time
    ctx.textAlign = "right";
    ctx.fillText("Game Time: ", divider, labelY);
    ctx.textAlign = "left";
    ctx.fillText(this.gameState.maxGameTime - Math.floor(this.gameState.gameTimer.getProgress() * this.gameState.maxGameTime), divider, labelY);
    labelY += rowPadding;
    // Game Speed
    ctx.textAlign = "right";
    ctx.fillText("Game Speed: ", divider, labelY);
    ctx.textAlign = "left";
    let gameSpeed = this.gameState.gameSpeed == 0 ? 1 : this.gameState.gameSpeed * 10;
    ctx.fillText(`x${gameSpeed}`, divider, labelY);
    labelY += rowPadding;
    labelY += rowPadding;

    //red           blue
    //2     captures  0
    //5     kills   8

    ctx.fillStyle = COLORS.red;
    ctx.textAlign = "right";
    ctx.fillText("Red", center - columnPadding, labelY);
    ctx.fillStyle = COLORS.blue;
    ctx.textAlign = "left";
    ctx.fillText("Blue", center + columnPadding, labelY);
    labelY += rowPadding;
    ctx.fillStyle = COLORS.red;
    ctx.textAlign = "right";
    ctx.fillText(this.gameState.redTeam.totalKills, center - columnPadding, labelY);
    ctx.fillStyle = COLORS.gold;
    ctx.textAlign = "center";
    ctx.fillText("Kills", center, labelY);
    ctx.fillStyle = COLORS.blue;
    ctx.textAlign = "left";
    ctx.fillText(this.gameState.blueTeam.totalKills, center + columnPadding, labelY);
    labelY += rowPadding;
    ctx.fillStyle = COLORS.red;
    ctx.textAlign = "right";
    ctx.fillText(this.gameState.redTeam.totalCaps, center - columnPadding, labelY);
    ctx.fillStyle = COLORS.gold;
    ctx.textAlign = "center";
    ctx.fillText("Caps", center, labelY);
    ctx.fillStyle = COLORS.blue;
    ctx.textAlign = "left";
    ctx.fillText(this.gameState.blueTeam.totalCaps, center + columnPadding, labelY);
    labelY += rowPadding;
    labelY += rowPadding + 8;
    // Graph
    ctx.fillStyle = COLORS.gold;
    ctx.textAlign = "center";
    ctx.fillText("Fitness", center, labelY);
    labelY += rowPadding - 8;
    let graphX = menuXStart + 40;
    let graphY = labelY;
    let graphWidth = this.gameState.maxFits * 2;
    let graphHeight = 50;
    ctx.strokeStyle = COLORS.white;
    ctx.lineWidth = "2";
    ctx.beginPath();
    ctx.rect(graphX, graphY, graphWidth, graphHeight);
    ctx.stroke();
    let max = -Infinity;
    for (let i = 0; i < this.gameState.fits.length; i++) {
      if (this.gameState.fits[i][0] > max) {
        max = this.gameState.fits[i][0];
      }
      if (this.gameState.fits[i][1] > max) {
        max = this.gameState.fits[i][1];
      }
    }
    if (max > 0) {
      for (let i = 0; i < this.gameState.fits.length; i++) {
        let col = graphX + (i * 2);
        let red = Math.floor(this.gameState.fits[i][0] / max * graphHeight);
        let blue = Math.floor(this.gameState.fits[i][1] / max * graphHeight);
        ctx.fillStyle = COLORS.red;
        ctx.fillRect(col, graphY + graphHeight - red, 1, 1);
        ctx.fillStyle = COLORS.blue;
        ctx.fillRect(col, graphY + graphHeight - blue, 1, 1);
        if (i > 0) {
          let lastRed = Math.floor(this.gameState.fits[i - 1][0] / max * graphHeight);
          let lastBlue = Math.floor(this.gameState.fits[i - 1][1] / max * graphHeight);
          ctx.lineWidth = 1;
          ctx.strokeStyle = COLORS.red;
          ctx.beginPath();
          ctx.moveTo(col - 2, graphY + graphHeight - lastRed);
          ctx.lineTo(col, graphY + graphHeight - red);
          ctx.stroke();
          ctx.strokeStyle = COLORS.blue;
          ctx.beginPath();
          ctx.moveTo(col - 2, graphY + graphHeight - lastBlue);
          ctx.lineTo(col, graphY + graphHeight - blue);
          ctx.stroke();
        }
        // if (red > blue) {
        //   ctx.fillStyle = COLORS.red;
        //   ctx.fillRect(col, graphY + graphHeight - red, 2, red);
        //   ctx.fillStyle = COLORS.blue;
        //   ctx.fillRect(col, graphY + graphHeight - blue, 2, blue);
        // } else if (blue > red) {
        //   ctx.fillStyle = COLORS.blue;
        //   ctx.fillRect(col, graphY + graphHeight - blue, 2, blue);
        //   ctx.fillStyle = COLORS.red;
        //   ctx.fillRect(col, graphY + graphHeight - red, 2, red);
        // } else {
        //   ctx.fillStyle = COLORS.purple;
        //   ctx.fillRect(col, graphY + graphHeight - red, 2, red);
        // }
      }
    }



    // Buttons
    this.menuButton.render(ctx, "Menu",);
    this.slowerButton.render(ctx, "-",);
    this.fasterButton.render(ctx, "+",);
  };
};