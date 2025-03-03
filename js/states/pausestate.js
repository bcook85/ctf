'use strict';

class PauseState extends State {
  constructor(game) {
    super(game);
    this.buttonWidth = 96;
    this.buttonHeight = 32;
    this.buttonPadding = 8;
    this.resumeButton = new Button(
      Math.floor((this.game.screen.width * 0.5) - (this.buttonWidth * 0.5)),
      148,
      this.buttonWidth,
      this.buttonHeight
    );
    this.saveButton = new Button(
      Math.floor((this.game.screen.width * 0.5) - (this.buttonWidth * 0.5)),
      this.resumeButton.y + this.buttonHeight + this.buttonPadding,
      this.buttonWidth,
      this.buttonHeight
    );
    this.quitButton = new Button(
      Math.floor((this.game.screen.width * 0.5) - (this.buttonWidth * 0.5)),
      this.saveButton.y + this.buttonHeight + this.buttonPadding,
      this.buttonWidth,
      this.buttonHeight
    );
  };
  update(dt) {
    this.resumeButton.update(this.game.mouse);
    this.saveButton.update(this.game.mouse);
    this.quitButton.update(this.game.mouse);
    if (this.resumeButton.isClick || this.game.keys.isUp("Escape")) {
      this.leave();
      return;
    }
    if (this.saveButton.isClick) {
      this.saveNEFTs();
      return;
    }
    if (this.quitButton.isClick) {
      this.reset();
      return;
    }
  };
  saveNEFTs() {
    let redData = this.parent.gameState.redNEFT.save();
    let blueData = this.parent.gameState.blueNEFT.save();
    let neatData = JSON.stringify({
      "generation": this.parent.gameState.generation,
      "redData": redData,
      "blueData": blueData
    });
    let file = new Blob([neatData], {type: 'text/json'});
    let a = document.createElement("a");
    let url = URL.createObjectURL(file);
    a.href = url;
    a.download = `CTF_gen${this.parent.gameState.generation}.json`;
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  };
  render(ctx) {
    // Background
    ctx.fillStyle = COLORS.black;
    ctx.fillRect(212, 70, 212, 210);
    ctx.beginPath();
    ctx.lineWidth = "3";
    ctx.strokeStyle = COLORS.gold;
    ctx.rect(212, 70, 212, 210);
    ctx.stroke();
    // State Title
    ctx.font = FONTS.medium;
    ctx.fillStyle = COLORS.gold;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      "- Paused -"
      ,Math.floor(this.game.screen.width * 0.5)
      ,96
    );
    // Buttons
    this.resumeButton.render(ctx, "Resume");
    this.saveButton.render(ctx, "Save");
    this.quitButton.render(ctx, "Quit");
  };
};