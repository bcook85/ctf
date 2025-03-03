'use strict';

class TrainSetupState extends State {
  constructor(game) {
    super(game);
    this.buttonWidth = 96;
    this.buttonHeight = 32;
    // Navigation Buttons
    this.backButton = new Button(
      48,
      this.game.screen.height - 64,
      this.buttonWidth,
      this.buttonHeight
    );
    this.playButton = new Button(
      this.game.screen.width - this.buttonWidth - 48,
      this.game.screen.height - 64,
      this.buttonWidth,
      this.buttonHeight
    );
    // NN Setup Buttons
    this.labelX = 256;
    this.labelY = 96;
    this.buttonY = 78;
    this.rowPadding = 48;
    this.lbx = 264;// Right Button Column X Position
    this.mbx = 380;// Middle Button Column X Position
    this.rbx = 496;// Left Button Column X Position
    this.loadButton = new Button(
      Math.floor((this.game.screen.width * 0.5) - (this.buttonWidth * 0.5)),
      this.game.screen.height - 64,
      this.buttonWidth,
      this.buttonHeight
    );
    this.selectedMapSize = "medium";
    this.mapSizeButtons = {
      "small": new Button(this.lbx, this.buttonY + (this.rowPadding * 0), this.buttonWidth, this.buttonHeight),
      "medium": new Button(this.mbx, this.buttonY + (this.rowPadding * 0), this.buttonWidth, this.buttonHeight),
      "large": new Button(this.rbx, this.buttonY + (this.rowPadding * 0), this.buttonWidth, this.buttonHeight)
    };
    this.selectedDimension = "medium";
    this.dimensionButtons = {
      "small": new Button(this.lbx, this.buttonY + (this.rowPadding * 1), this.buttonWidth, this.buttonHeight),
      "medium": new Button(this.mbx, this.buttonY + (this.rowPadding * 1), this.buttonWidth, this.buttonHeight),
      "large": new Button(this.rbx, this.buttonY + (this.rowPadding * 1), this.buttonWidth, this.buttonHeight)
    };
    this.selectedRate = "medium";
    this.rateButtons = {
      "small": new Button(this.lbx, this.buttonY + (this.rowPadding * 2), this.buttonWidth, this.buttonHeight),
      "medium": new Button(this.mbx, this.buttonY + (this.rowPadding * 2), this.buttonWidth, this.buttonHeight),
      "large": new Button(this.rbx, this.buttonY + (this.rowPadding * 2), this.buttonWidth, this.buttonHeight)
    };
    this.selectedScale = "medium";
    this.scaleButtons = {
      "small": new Button(this.lbx, this.buttonY + (this.rowPadding * 3), this.buttonWidth, this.buttonHeight),
      "medium": new Button(this.mbx, this.buttonY + (this.rowPadding * 3), this.buttonWidth, this.buttonHeight),
      "large": new Button(this.rbx, this.buttonY + (this.rowPadding * 3), this.buttonWidth, this.buttonHeight)
    };
  };
  update(dt) {
    // Navigation Buttons
    this.backButton.update(this.game.mouse);
    if (this.backButton.isClick) {
      this.leave();
      return;
    }
    this.playButton.update(this.game.mouse);
    if (this.playButton.isClick) {
      new TrainState(this.game).enter();
      return;
    }
    // Option Buttons
    this.mapSizeButtons.small.update(this.game.mouse);
    if (this.mapSizeButtons.small.isClick) {
      this.selectedMapSize = "small";
      PLAYER.map = this.selectedMapSize;
      return;
    }
    this.mapSizeButtons.medium.update(this.game.mouse);
    if (this.mapSizeButtons.medium.isClick) {
      this.selectedMapSize = "medium";
      PLAYER.map = this.selectedMapSize;
      return;
    }
    this.mapSizeButtons.large.update(this.game.mouse);
    if (this.mapSizeButtons.large.isClick) {
      this.selectedMapSize = "large";
      PLAYER.map = this.selectedMapSize;
      return;
    }
    this.dimensionButtons.small.update(this.game.mouse);
    if (this.dimensionButtons.small.isClick) {
      this.selectedDimension = "small";
      PLAYER.brainDimensions = this.selectedDimension;
      return;
    }
    this.dimensionButtons.medium.update(this.game.mouse);
    if (this.dimensionButtons.medium.isClick) {
      this.selectedDimension = "medium";
      PLAYER.brainDimensions = this.selectedDimension;
      return;
    }
    this.dimensionButtons.large.update(this.game.mouse);
    if (this.dimensionButtons.large.isClick) {
      this.selectedDimension = "large";
      PLAYER.brainDimensions = this.selectedDimension;
      return;
    }
    this.rateButtons.small.update(this.game.mouse);
    if (this.rateButtons.small.isClick) {
      this.selectedRate = "small";
      PLAYER.mutationRate = this.selectedRate;
      return;
    }
    this.rateButtons.medium.update(this.game.mouse);
    if (this.rateButtons.medium.isClick) {
      this.selectedRate = "medium";
      PLAYER.mutationRate = this.selectedRate;
      return;
    }
    this.rateButtons.large.update(this.game.mouse);
    if (this.rateButtons.large.isClick) {
      this.selectedRate = "large";
      PLAYER.mutationRate = this.selectedRate;
      return;
    }
    this.scaleButtons.small.update(this.game.mouse);
    if (this.scaleButtons.small.isClick) {
      this.selectedScale = "small";
      PLAYER.mutationScale = this.selectedScale;
      return;
    }
    this.scaleButtons.medium.update(this.game.mouse);
    if (this.scaleButtons.medium.isClick) {
      this.selectedScale = "medium";
      PLAYER.mutationScale = this.selectedScale;
      return;
    }
    this.scaleButtons.large.update(this.game.mouse);
    if (this.scaleButtons.large.isClick) {
      this.selectedScale = "large";
      PLAYER.mutationScale = this.selectedScale;
      return;
    }
    // Load Button
    this.loadButton.update(this.game.mouse);
    if (this.loadButton.isClick) {
      this.loadBrains();
      return;
    }
  };
  loadBrains() {
    let fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".json";
    fileInput.onchange = () => {
      let fr = new FileReader();
      fr.readAsText(fileInput.files[0], "UTF-8");
      fr.onload = (evt) => {
        PLAYER.loadedBrains = evt.target.result;
        new TrainState(this.game).enter();
      };
    };
    fileInput.click();
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
      "Simulation Setup"
      ,Math.floor(this.game.screen.width * 0.5)
      ,24
    );
    // NN Options
    this.renderOptions(ctx);
    // Navigation Buttons
    this.backButton.render(ctx, "Back");
    this.playButton.render(ctx, "Play");
    // Map Buttons
    let highlightPadding = 6;
    ctx.fillStyle = COLORS.gold;
    ctx.fillRect(
      this.mapSizeButtons[this.selectedMapSize].x - highlightPadding,
      this.mapSizeButtons[this.selectedMapSize].y - highlightPadding,
      this.buttonWidth + (highlightPadding * 2),
      this.buttonHeight + (highlightPadding * 2),
    );
    this.mapSizeButtons.small.render(ctx, "Small");
    this.mapSizeButtons.medium.render(ctx, "Medium");
    this.mapSizeButtons.large.render(ctx, "Large");
    // Dimension Buttons
    ctx.fillStyle = COLORS.gold;
    ctx.fillRect(
      this.dimensionButtons[this.selectedDimension].x - highlightPadding,
      this.dimensionButtons[this.selectedDimension].y - highlightPadding,
      this.buttonWidth + (highlightPadding * 2),
      this.buttonHeight + (highlightPadding * 2),
    );
    this.dimensionButtons.small.render(ctx, "Small");
    this.dimensionButtons.medium.render(ctx, "Medium");
    this.dimensionButtons.large.render(ctx, "Large");
    // Rate Buttons
    ctx.fillStyle = COLORS.gold;
    ctx.fillRect(
      this.rateButtons[this.selectedRate].x - highlightPadding,
      this.rateButtons[this.selectedRate].y - highlightPadding,
      this.buttonWidth + (highlightPadding * 2),
      this.buttonHeight + (highlightPadding * 2),
    );
    this.rateButtons.small.render(ctx, "Small");
    this.rateButtons.medium.render(ctx, "Medium");
    this.rateButtons.large.render(ctx, "Large");
    // Scale Buttons
    ctx.fillStyle = COLORS.gold;
    ctx.fillRect(
      this.scaleButtons[this.selectedScale].x - highlightPadding,
      this.scaleButtons[this.selectedScale].y - highlightPadding,
      this.buttonWidth + (highlightPadding * 2),
      this.buttonHeight + (highlightPadding * 2),
    );
    this.scaleButtons.small.render(ctx, "Small");
    this.scaleButtons.medium.render(ctx, "Medium");
    this.scaleButtons.large.render(ctx, "Large");
    // Load Button
    this.loadButton.render(ctx, "Load");
  };
  renderOptions(ctx) {
    ctx.font = FONTS.medium;
    ctx.fillStyle = COLORS.gold;
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    let labelY = this.labelY;
    // Map: Small Medium Large
    ctx.fillText("Map Size: ", this.labelX, labelY);
    labelY += this.rowPadding;
    // Brain Dimensions: Small Medium Large
    ctx.fillText("Brain Dimensions: ", this.labelX, labelY);
    labelY += this.rowPadding;
    // Mutation Rate: Small Medium Large
    ctx.fillText("Mutation Rate: ", this.labelX, labelY);
    labelY += this.rowPadding;
    // Mutation Scale: Small Medium Large
    ctx.fillText("Mutation Scale: ", this.labelX, labelY);
  };
};