'use strict';

class MainState extends State {
  constructor(game) {
    super(game);
    this.buttonStartX = 10;
    this.buttonStartY = 160;
    this.buttonWidth = 96;
    this.buttonHeight = 32;
    this.buttonPadding = 8;
    this.buttonColumnRight = this.buttonWidth + (this.buttonStartX * 2);
    this.playButton = new Button(
      this.buttonStartX,
      this.buttonStartY,
      this.buttonWidth,
      this.buttonHeight
    );
    this.infoButton = new Button(
      this.buttonStartX,
      this.playButton.y + this.buttonHeight + this.buttonPadding,
      this.buttonWidth,
      this.buttonHeight
      );
  };
  update(dt) {
    this.playButton.update(this.game.mouse);
    if (this.playButton.isClick) {
      new TrainSetupState(this.game).enter();
      return;
    }
    this.infoButton.update(this.game.mouse);
    if (this.infoButton.isClick) {
      new InfoState(this.game).enter();
      return;
    }
  };
  render(ctx) {
    // Background
    ctx.fillStyle = COLORS.black;
    ctx.fillRect(0, 0, this.game.screen.canvas.width, this.game.screen.canvas.height);
    // Game Title
    ctx.font = FONTS.huge;
    ctx.fillStyle = COLORS.gold;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      "Capture The Flag",
      (this.game.screen.width * 0.5) + (this.buttonColumnRight * 0.5),
      32
    );
    // Game Subtitle
    ctx.font = FONTS.medium;
    ctx.fillStyle = COLORS.gold;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      "using Neuro Evolution with Fixed Topologies",
      (this.game.screen.width * 0.5) + (this.buttonColumnRight * 0.5),
      64
    );
    // Buttons
    ctx.fillStyle = COLORS.grey;
    ctx.fillRect(0, 0, this.buttonColumnRight, this.game.screen.canvas.height);
    this.playButton.render(ctx, "Play");
    this.infoButton.render(ctx, "Info");
    // Author Info
    ctx.font = FONTS.small;
    ctx.fillStyle = COLORS.gold;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      "by @bcook85 2025"
      ,(this.game.screen.width * 0.5) + (this.buttonColumnRight * 0.5)
      ,Math.floor(this.game.screen.canvas.height - 6)
    );
  };
};