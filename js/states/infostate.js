'use strict';

class InfoState extends State {
  constructor(game) {
    super(game);
    this.backButton = new Button(
      Math.floor(this.game.screen.width * 0.5) - 48,
      this.game.screen.height - 64,
      96,
      32
    );
  };
  update(dt) {
    this.backButton.update(this.game.mouse);
    if (this.backButton.isClick) {
      this.leave();
    }
  };
  render(ctx) {
    // Background
    ctx.fillStyle = COLORS.black;
    ctx.fillRect(0, 0, this.game.screen.width, this.game.screen.height);
    ctx.font = FONTS.large;
    ctx.fillStyle = COLORS.gold;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      "Game Info"
      ,Math.floor(this.game.screen.width * 0.5)
      ,24
    );
    // Buttons
    this.backButton.render(ctx, "Back");
  };
};