'use strict';

class Team {
  constructor(maxPlayers, playerStartPosition, flagHomePosition) {
    this.maxPlayers = maxPlayers;
    this.playerStartPosition = playerStartPosition;
    this.flagHomePosition = flagHomePosition;
    this.totalCaps = 0;
    this.totalKills = 0;
    // Players
    this.players = [];
    for (let i = 0; i < this.maxPlayers; i++) {
      let newPlayer = new Player(this.playerStartPosition.copy());
      newPlayer.a = Math.PI * 2 * Math.random();
      newPlayer.id = i;
      this.players.push(newPlayer);
    }
    // Flag
    this.flag = new Flag(this.flagHomePosition.copy());
    // Bullets
    this.bullets = [];
  };
  reset() {
    // Players
    for (let i = 0; i < this.players.length; i++) {
      this.players[i].reset();
    }
    // Flag
    this.flag.reset();
    // Bullets
    this.bullets = [];
  };
  addBullet(player) {
    let newBullet = new Bullet();
    newBullet.pos = player.pos.copy();
    newBullet.a = player.a;
    newBullet.owner = player;
    for (let i = 0; i < this.bullets.length; i++) {
      if (!this.bullets[i].alive) {
        this.bullets[i] = newBullet;
        return;
      }
    }
    this.bullets.push(newBullet);
  };
};