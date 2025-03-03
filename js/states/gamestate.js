'use strict';

class GameState extends State {
  constructor(game) {
    super(game);
    // Map
    this.map = new Map();
    this.map.load(MAPSIZES[PLAYER.map]);
    // Game Settings
    this.maxGameTime = this.map.gameTime;
    this.gameTimer = new Timer(this.maxGameTime);
    this.brainIndex = 0;
    this.generation = 0;
    this.gameSpeed = 0;
    this.maxBrains = 100;
    this.maxFits = 100;
    this.maxPlayers = 4;
    this.fits = [];
    this.neftInputs = 23;
    this.neftOutputs = 5;
    // Collision Manager
    this.collisionManager = new CollisionManager(
      this.map.w,
      this.map.h,
      (x, y) => this.map.getCollision(x, y)
    );
    // Red Team
    this.redTeam = new Team(
      this.maxPlayers,
      this.map.redTeam.playerSpawn.copy(),
      this.map.redTeam.flagSpawn.copy()
    );
    this.redNEFT = undefined;
    // Blue Team
    this.blueTeam = new Team(
      this.maxPlayers,
      this.map.blueTeam.playerSpawn.copy(),
      this.map.blueTeam.flagSpawn.copy()
    );
    this.blueNEFT = undefined;
    if (PLAYER.loadedBrains != undefined) {
      console.log("NEFT: File Data");
      let fileData = JSON.parse(PLAYER.loadedBrains);
      this.generation = fileData.generation;
      this.redNEFT = new NEFT(0,[],0,0);
      this.redNEFT.load(fileData.redData);
      this.blueNEFT = new NEFT(0,[],0,0);
      this.blueNEFT.load(fileData.blueData);
      PLAYER.loadedBrains = undefined;
    } else {
      console.log("NEFT: New Data");
      this.redNEFT = new NEFT(
        this.maxBrains,
        [this.neftInputs].concat(BRAINDIMENSIONS[PLAYER.brainDimensions]).concat([this.neftOutputs]),
        MUTATIONRATES[PLAYER.mutationRate],
        MUTATIONSCALES[PLAYER.mutationScale]
      );
      this.blueNEFT = new NEFT(
        this.maxBrains,
        [this.neftInputs].concat(BRAINDIMENSIONS[PLAYER.brainDimensions]).concat([this.neftOutputs]),
        MUTATIONRATES[PLAYER.mutationRate],
        MUTATIONSCALES[PLAYER.mutationScale]
      );
    }
    // Neural Vision
    this.objectTypeCount = 8;
    this.nnVision = {
      "objectTypes": {
        "empty": 0 / this.objectTypeCount,
        "wall": 1 / this.objectTypeCount,
        "teamFlag": 2 / this.objectTypeCount,
        "enemyFlag": 3 / this.objectTypeCount,
        "ally": 4 / this.objectTypeCount,
        "enemy": 5 / this.objectTypeCount,
        "allyCarrier": 6 / this.objectTypeCount,
        "enemyCarrier": 7 / this.objectTypeCount,
        "bullet": 8 / this.objectTypeCount
      },
      "rayCount": 7,
      "fov": 60 * Math.PI / 180,
      "fovHalf": undefined,
      "maxDistance": 16,
      "rays": []
    };
    // Init Rays
    this.nnVision.fovHalf = this.nnVision.fov * 0.5;
    let rayAngle = this.nnVision.fov / (this.nnVision.rayCount - 1);
    // Wall Cast, DDA
    for (let i = 0; i < this.nnVision.rayCount; i++) {
      let angle = 0 - this.nnVision.fovHalf;
      angle += i * rayAngle;
      this.nnVision.rays.push(angle);
    }
  };
  update(dt) {
    // Game Speed Timing
    let deltaTime = this.gameSpeed == 1 ? dt : 1 / 60;
    let gameSpeed = this.gameSpeed == 0 ? 1 : this.gameSpeed * 10;
    for (let g = 0; g < gameSpeed; g++) {
      this.gameTimer.tick(deltaTime);
      if (this.gameTimer.isDone()) {
        // NEFT Score
        for (let j = 0; j < this.redTeam.players.length; j++) {
          // captures
          this.redNEFT.addScore(this.brainIndex + j, this.redTeam.players[j].captures * POINTS.capture);
          // pickups
          this.redNEFT.addScore(this.brainIndex + j, this.redTeam.players[j].pickups * POINTS.pickup);
          // returns
          this.redNEFT.addScore(this.brainIndex + j, this.redTeam.players[j].returns * POINTS.return);
          // hits
          this.redNEFT.addScore(this.brainIndex + j, this.redTeam.players[j].hits * POINTS.hit);
          // kills
          this.redNEFT.addScore(this.brainIndex + j, this.redTeam.players[j].kills * POINTS.kill);
          // accuracy
          if (this.redTeam.players[j].shots > 0) {
            this.redNEFT.addScore(
              this.brainIndex + j,
              (this.redTeam.players[j].hits / this.redTeam.players[j].shots) * POINTS.accuracy
            ); 
          }
          // exploration
          this.redNEFT.addScore(
            this.brainIndex + j,
            (this.redTeam.players[j].visited.length / this.map.walkableTiles) * POINTS.exploration
          );
        }
        for (let j = 0; j < this.blueTeam.players.length; j++) {
          // captures
          this.blueNEFT.addScore(this.brainIndex + j, this.blueTeam.players[j].captures * POINTS.capture);
          // pickups
          this.blueNEFT.addScore(this.brainIndex + j, this.blueTeam.players[j].pickups * POINTS.pickup);
          // returns
          this.blueNEFT.addScore(this.brainIndex + j, this.blueTeam.players[j].returns * POINTS.return);
          // hits
          this.blueNEFT.addScore(this.brainIndex + j, this.blueTeam.players[j].hits * POINTS.hit);
          // kills
          this.blueNEFT.addScore(this.brainIndex + j, this.blueTeam.players[j].kills * POINTS.kill);
          // accuracy
          if (this.blueTeam.players[j].shots > 0) {
            this.blueNEFT.addScore(
              this.brainIndex + j,
              (this.blueTeam.players[j].hits / this.blueTeam.players[j].shots) * POINTS.accuracy
            ); 
          }
          // exploration
          this.blueNEFT.addScore(
            this.brainIndex + j,
            (this.blueTeam.players[j].visited.length / this.map.walkableTiles) * POINTS.exploration
          );
        }
        // Reset Sim
        this.gameTimer.reset();
        this.redTeam.reset();
        this.blueTeam.reset();
        // Update for next brain/generation
        this.brainIndex += this.maxPlayers;
        if (this.brainIndex >= this.maxBrains) {
          this.brainIndex = 0;
          this.generation += 1;
          this.redNEFT.nextGeneration();
          this.blueNEFT.nextGeneration();
          this.fits.push([
            this.redNEFT.totalFitness,
            this.blueNEFT.totalFitness
          ]);
          while (this.fits.length > this.maxFits) {
            this.fits.shift();
          }
        }
      } else {
        // NN Vision & Controls
        for (let i = 0; i < this.redTeam.players.length; i++) {
          this.playerVision(this.redTeam, i, this.blueTeam);
          this.playerControls(
            this.redTeam.players[i],
            this.redNEFT.process(this.brainIndex + i, this.redTeam.players[i].vision)
          );
        }
        for (let i = 0; i < this.blueTeam.players.length; i++) {
          this.playerVision(this.blueTeam, i, this.redTeam);
          this.playerControls(
            this.blueTeam.players[i],
            this.blueNEFT.process(this.brainIndex + i, this.blueTeam.players[i].vision)
          );
        }
        // Team Updates
        this.updateTeam(this.redTeam, this.blueTeam, deltaTime);
        this.updateTeam(this.blueTeam, this.redTeam, deltaTime);
        // Collision Manager
        for (let i = 0; i < this.redTeam.players.length; i++) {
          if (this.redTeam.players[i].alive) {
            this.collisionManager.addEntity(this.redTeam.players[i]);
          }
        }
        for (let i = 0; i < this.blueTeam.players.length; i++) {
          if (this.blueTeam.players[i].alive) {
            this.collisionManager.addEntity(this.blueTeam.players[i]);
          }
        }
        this.collisionManager.update();
        this.collisionManager.reset();
      }
    }
  };
  render(ctx) {};
  updateTeam(team, enemyTeam, dt) {
    // Players
    for (let i = 0; i < team.players.length; i++) {
      if (team.players[i].alive) {
        this.updatePlayer(team, i, enemyTeam, dt);
      } else {
        team.players[i].respawnTimer.tick(dt);
        if (team.players[i].respawnTimer.isDone()) {
          team.players[i].respawn();
        }
      }
    }
    // Flag
    this.updateFlag(team.flag, dt);
    // Bullets
    for (let i = 0; i < team.bullets.length; i++) {
      if (team.bullets[i].alive) {
        this.updateBullet(team, i, enemyTeam, dt);
      }
    }
  };
  updatePlayer(team, playerID, enemyTeam, dt) {
    let player = team.players[playerID];
    // Move
    player.applyMovement(dt);
    // Fire
    player.fireTimer.tick(dt);
    if (player.fire == 1 && player.fireTimer.isDone()) {
      team.addBullet(player);
      player.fireTimer.reset();
      player.shots += 1;
    }
    // Visited Tiles
    let x = Math.floor(player.pos.x);
    let y = Math.floor(player.pos.y);
    let found = false;
    for (let j = 0; j < player.visited.length; j++) {
      if (player.visited[j][0] == x && player.visited[j][1] == y) {
        found = true;
        break;
      }
    }
    if (!found) {
      player.visited.push([x,y]);
    }
    // Team Flag
    if (team.flag.atHome == 0 && team.flag.isCarried == 0) {
      let d = player.pos.getDistance(team.flag.pos);
      if (d <= player.r + team.flag.r) {
        team.flag.atHome = 1;
        team.flag.pos = team.flagHomePosition.copy();
        team.flag.isCarried = 0;
        team.flag.carrier = undefined;
        player.returns += 1;
      }
    }
    // Enemy Team Flag
    if (player.isCarrying == 1 && team.flag.atHome == 1) {
      let d = player.pos.getDistance(team.flagHomePosition);
      if (d <= player.r) {
        player.isCarrying = 0;
        enemyTeam.flag.atHome = 1;
        enemyTeam.flag.pos = enemyTeam.flagHomePosition.copy();
        enemyTeam.flag.isCarried = 0;
        enemyTeam.flag.carrier = undefined;
        player.captures += 1;
        team.totalCaps += 1;
      }
    }
    if (enemyTeam.flag.isCarried == 0) {
      let d = player.pos.getDistance(enemyTeam.flag.pos);
      if (d <= player.r + enemyTeam.flag.r) {
        enemyTeam.flag.atHome = 0;
        enemyTeam.flag.isCarried = 1;
        enemyTeam.flag.carrier = player;
        player.isCarrying = 1;
        player.pickups += 1;
      }
    }
  };
  updateBullet(team, bulletID, enemyTeam, dt) {
    let bullet = team.bullets[bulletID];
    bullet.lifeTimer.tick(dt);
    if (bullet.lifeTimer.isDone()) {
      bullet.alive = false;
      return;
    }
    bullet.applyMovement(dt);
    if (this.map.getCollision(Math.floor(bullet.pos.x), Math.floor(bullet.pos.y))) {
      bullet.alive = false;
      return;
    } else {
      for (let j = 0; j < enemyTeam.players.length; j++) {
        let p = enemyTeam.players[j];
        if (p.alive) {
          if (bullet.pos.getDistance(p.pos) <= bullet.r + p.r) {
            bullet.alive = false;
            p.takeDamage(bullet.damage);
            bullet.owner.hits += 1;
            if (!p.alive) {
              bullet.owner.kills += 1;
              team.totalKills += 1;
            }
            return;
          }
        }
      }
    }
  };

  updateFlag(flag, dt) {
    if (flag.atHome == 1) { return; }
    if (flag.carrier !== undefined) {
      if (!flag.carrier.alive) {
        flag.isCarried = 0;
        flag.carrier = undefined;
      } else {
        flag.pos.x = flag.carrier.pos.x;
        flag.pos.y = flag.carrier.pos.y;
      }
      return;
    }
    flag.resetTimer.tick(dt);
    if (flag.resetTimer.isDone()) {
      flag.reset();
    }
  };

  
  playerVision(team, playerID, enemyTeam) {
    let p = team.players[playerID];
    let pos = p.pos.vAdd(new Vector(1, 0).rot(p.a).nMul(p.r));
    p.vision = [];
    // Ray Casts
    if (!p.alive) {
      for (let j = 0; j < this.nnVision.rays.length; j++) {
        p.vision.push(0);//type
        p.vision.push(0);//distance
      }
    } else {
      for (let i = 0; i < this.nnVision.rays.length; i++) {
        let objectType = this.nnVision.objectTypes.empty;
        let dist = this.nnVision.maxDistance;
        // walls
        let wallDist = dda(
          pos,
          p.a + this.nnVision.rays[i],
          (x, y) => this.map.getCollision(x, y),
          this.nnVision.maxDistance
        );
        if (wallDist < dist) {
          objectType = this.nnVision.objectTypes.wall;
          dist = wallDist;
        }
        // flags
        let teamFlagDist = objectCast(
          pos,
          p.a + this.nnVision.rays[i],
          team.flag.pos,
          team.flag.r,
          this.nnVision.maxDistance
        );
        if (teamFlagDist < dist) {
          objectType = this.nnVision.objectTypes.teamFlag;
          dist = teamFlagDist;
        }
        if (p.isCarrying == 0) { // or all they see is the flag, duh
          let enemyFlagDist = objectCast(
            pos,
            p.a + this.nnVision.rays[i],
            enemyTeam.flag.pos,
            enemyTeam.flag.r,
            this.nnVision.maxDistance
          );
          if (enemyFlagDist < dist) {
            objectType = this.nnVision.objectTypes.enemyFlag;
            dist = enemyFlagDist;
          }

        }
        // allies
        for (let k = 0; k < team.players.length; k++) {
          if (k == playerID) { continue; }
          if (!team.players[k].alive) { continue; }
          let allyDist = objectCast(
            pos,
            p.a + this.nnVision.rays[i],
            team.players[k].pos,
            team.players[k].r,
            this.nnVision.maxDistance
          );
          if (allyDist < dist) {
            if (team.players[k].isCarrying) {
              objectType = this.nnVision.objectTypes.allyCarrier;
            } else {
              objectType = this.nnVision.objectTypes.ally;
            }
            dist = allyDist;
          }
        }
        // enemies
        for (let k = 0; k < enemyTeam.players.length; k++) {
          if (!enemyTeam.players[k].alive) { continue; }
          let enemyDist = objectCast(
            pos,
            p.a + this.nnVision.rays[i],
            enemyTeam.players[k].pos,
            enemyTeam.players[k].r,
            this.nnVision.maxDistance
          );
          if (enemyDist < dist) {
            if (enemyTeam.players[k].isCarrying) {
              objectType = this.nnVision.objectTypes.enemyCarrier;
            } else {
              objectType = this.nnVision.objectTypes.enemy;
            }
            dist = enemyDist;
          }
        }
        // bullets
        for (let k = 0; k < enemyTeam.bullets.length; k++) {
          if (!enemyTeam.bullets[k].alive) { continue; }
          let bulletDist = objectCast(
            pos,
            p.a + this.nnVision.rays[i],
            enemyTeam.bullets[k].pos,
            enemyTeam.bullets[k].r,
            this.nnVision.maxDistance
          );
          if (bulletDist < dist) {
            objectType = this.nnVision.objectTypes.bullet;
            dist = bulletDist;
          }
        }
        p.vision.push(objectType);
        p.vision.push(Math.max(0, dist));
      }
    }
    // Attributes
    p.vision.push(p.hp / p.maxHealth);
    p.vision.push(p.fireTimer.getProgress());
    p.vision.push(p.isCarrying);
    // Flag Info
    p.vision.push(team.flag.atHome);
    p.vision.push(team.flag.isCarried);
    p.vision.push(enemyTeam.flag.atHome);
    p.vision.push(enemyTeam.flag.isCarried);
    p.vision.push(p.memory);
    p.vision.push(1);// bias
  };
  
  playerControls(player, controls) {
    player.move.x = 0;
    if (controls[0] > 0.75) {
      player.move.x = 1;
    } else if (controls[0] < 0.25) {
      player.move.x = -1;
    }
    player.move.y = 0;
    if (controls[1] > 0.75) {
      player.move.y = 1;
    } else if (controls[1] < 0.25) {
      player.move.y = -1;
    }
    player.turn = 0;
    if (controls[2] > 0.75) {
      player.turn = 1;
    } else if (controls[2] < 0.25) {
      player.turn = -1;
    }
    player.fire = controls[3] >= 0.75 ? 1 : 0;
    player.memory = controls[4];
  };
};