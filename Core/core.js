class GameCore {

  // Make new game
  constructor(canv) {
    // Creating canvas
    this.cnv = document.getElementById(canv);
    this.ctx = this.cnv.getContext('2d');

    // Canvas's sizes
    this.cnv.width  = window.innerWidth;
    this.cnv.height = window.innerHeight;

    // End & Pause
    this.isEnd    = false;
    this.isPause  = false;

    //  arrays of entities & bullets
    this._entities  = [];
    this._bullets   = [];

    // Game background (x2 for the infinity effect)
    this.bg = [
      {
        src: './Images/bg.jpg',
        pos: {
          x: 0,
          y: -this.cnv.height
        }
      },
      {
        src: './Images/bg.jpg',
        pos: {
          x: 0,
          y: 0
        }
      }
    ];

    // Player
    this.player = {
      width: 80,
      height: 80,
      color: 'green',
      src: './Images/starship.png',
      speed: 5,
      healf: 100,
      damage: 25,
      point: 0,
      pos: {
        x: this.cnv.width / 2 - 40,
        y: this.cnv.height - 180,
      }
    }

  }

  // Add new entity
  addEntity(opt) {
    this._entities.push({
      width   : opt.width   || 100,
      height  : opt.height  || 100,
      color   : opt.color   || 'white',
      src     : opt.src     || '',
      speed   : opt.speed   || 0,
      healf   : opt.healf   || 100,
      point   : opt.point   || 0,
      damage  : opt.damage  || 0,
      pos: {
        x     : opt.pos.x   || 0,
        y     : opt.pos.y   || 0
      }
    });
  }

  // Player control
  controller() {
    // All pressed keys now
    this._pressedKeys = [];

    // Use the player's attack
    document.addEventListener('click', () => {
      if (this.isEnd || this.isPause) return 0;
      this.attack();
    })

    // Movement
    document.addEventListener('keydown', (e) => {

      if (e.keyCode == 27) {
        if (this.isPause) {
          this.isPause = false;
        } else {
          this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
          this.ctx.fillRect(0, 0, this.cnv.width, this.cnv.height);
          this.ctx.fillStyle = '#333';
          this.ctx.font = "64px sans-serif";
          this.ctx.fillText('Pause', this.cnv.width / 2 - 90, this.cnv.height / 2)
          this.isPause = true;
        }
      }

      if (this.isEnd || this.isPause) return 0;

      if (e.keyCode == 87 ||
        e.keyCode == 65 ||
        e.keyCode == 83 ||
        e.keyCode == 68) {
        this._pressedKeys[e.keyCode] = true
      }
      if (e.keyCode == 32) {
        this.attack();
      }
    });
    document.addEventListener('keyup', (e) => {
      if (this.isEnd || this.isPause) return 0;

      if (e.keyCode == 87 ||
        e.keyCode == 65 ||
        e.keyCode == 83 ||
        e.keyCode == 68) {
        this._pressedKeys[e.keyCode] = false
      }
    });

    // Block the context menu
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    // Stop the movement when window is blur
    window.addEventListener('blur', () => {
      this._pressedKeys = [];
    });
  }

  // Draw the game on the canvas
  draw() {

    // Clear the canvas
    this.ctx.clearRect(0, 0, this.cnv.width, this.cnv.height);

    // Background
    {
      if (this.bg.src !== '') {
        for (let i = 0; i < 2; i++) {
          let bg = new Image(this.cnv.width, this.cnv.height);
          bg.src = this.bg[i].src;
          this.ctx.drawImage(bg, this.bg[i].pos.x, this.bg[i].pos.y, this.cnv.width, this.cnv.height);
        }
      }
    }

    // Entities
    {

      for (let i = 0; i < this._entities.length; i++) {

        this.ctx.beginPath();

        // Draw entities
        if (this._entities[i].src != '') {

          // Entities skin
          let unity = new Image(this._entities[i].width, this._entities[i].height);
          unity.src = this._entities[i].src;

          this.ctx.drawImage(unity, this._entities[i].pos.x, this._entities[i].pos.y, unity.width, unity.height);

        }

        // Draw entities healf
        this.ctx.fillStyle = 'rgba(255,0,0,0.5)';
        this.ctx.fillRect(this._entities[i].pos.x, this._entities[i].pos.y - 15, this._entities[i].healf, 5);

        this.ctx.closePath();

      }
    }

    // Player
    {
      // Player skin
      let unity = new Image(this.player.width, this.player.height);
      unity.src = this.player.src;

      this.ctx.drawImage(unity, this.player.pos.x, this.player.pos.y, unity.width, unity.height);
    }

    // Bullets
    {
      for (let i = 0; i < this._bullets.length; i++) {

        this.ctx.beginPath();

        this.ctx.fillStyle = this._bullets[i].color;
        this.ctx.fillRect(this._bullets[i].pos.x, this._bullets[i].pos.y, this._bullets[i].width, this._bullets[i].height);

        this.ctx.closePath();

      }
    }

  }

  // Player & enemies movement
  move() {

    // Player's movement
    {
      if (this._pressedKeys[87] && this.player.pos.y > 0) this.player.pos.y -= this.player.speed                                    // Up
      if (this._pressedKeys[83] && this.player.pos.y < this.cnv.height - this.player.height) this.player.pos.y += this.player.speed // Down
      if (this._pressedKeys[65] && this.player.pos.x > 0) this.player.pos.x -= this.player.speed                                    // Left
      if (this._pressedKeys[68] && this.player.pos.x < this.cnv.width - this.player.width) this.player.pos.x += this.player.speed   // Right
    }

    // Entities movement
    for (let i = 0; i < this._entities.length; i++) {

      this._entities[i].pos.x += this._entities[i].speed;
      this._entities[i].pos.y += 2;

      // Bouncing off walls
      if (this._entities[i].pos.x <= 25 || this._entities[i].pos.x >= this.cnv.width - this._entities[i].width - 25) {
        this._entities[i].speed = -this._entities[i].speed;
      }

      // Delete enimies if they fall outside the borders
      if (this._entities[i].pos.y >= this.cnv.height) this._entities.splice(i, 1);

      // Checking whether the player has encountered an enemy
      if (this.UnityCollision(this._entities[i], this.player)) this.die();

    }

    // Bullets's movement following the player
    for (let i = 0; i < this._bullets.length; i++) {
      this._bullets[i].pos.x = this.player.pos.x + this.player.width / 2 - 2;
      this._bullets[i].pos.y = -(this.cnv.height - this.player.pos.y);
    }

    // "live" background
    for (let i = 0; i < 2; i++) {
      // Return the background to original position
      if (this.bg[i].pos.y >= this.cnv.height)
        this.bg[i].pos.y = -this.cnv.height;

      // background's movement
      this.bg[i].pos.y += 2
    };
  }

  // Main game loop
  loop() {
    if (this.isPause) return;

    this.move();
    this.draw();
  }

  // Аuxiliary function
  random(min, max) { return Math.random() * (max - min) + min; }

  // Player attack
  attack() {

    // Laser audio sound
    let laserAudio = new Audio();
    laserAudio.src = './Sounds/laser.mp3';
    laserAudio.play();

    // Create a bullet
    this._bullets.push({
      damage: this.player.damage,
      width: 4,
      height: this.cnv.height,
      color: 'lime',
      pos: {
        x: this.player.pos.x + this.player.width / 2 - 2,
        y: -(this.cnv.height - this.player.pos.y)
      }
    });

    // Сhecking if someone was hit by a bullet
    for (let i = 0; i < this._entities.length; i++) {

      if (this._entities[i].pos.x < this._bullets[this._bullets.length - 1].pos.x &&
          this._entities[i].pos.x + this._entities[i].width > this._bullets[this._bullets.length - 1].pos.x) {

        // Hit a enemy
        this._entities[i].healf -= this._bullets[this._bullets.length - 1].damage;

        // If enemies hp <= 0, then death
        if (this._entities[i].healf <= 0) {

          // Play explosion audio
          let explosion = new Audio();
          explosion.src = './Sounds/explosion.mp3'
          explosion.play();

          // Add 1 point if the player has killed an enemy
          this.player.point += this._entities[i].point;

          // Delete a dead enemy
          this._entities.splice(i, 1);
        };
      }
    }

    // Delete a bullet
    setTimeout(() => { this._bullets.shift() }, 100);

  }

  // Collision check
  UnityCollision(obj1, obj2) {

    var XColl = false; // Vertical collision
    var YColl = false; // Horizont collision

    // whether the object collided vertically | horizontal
    if ((obj1.pos.x + obj1.width >= obj2.pos.x) && (obj1.pos.x <= obj2.pos.x + obj2.width)) XColl = true;
    if ((obj1.pos.y + obj1.height >= obj2.pos.y) && (obj1.pos.y <= obj2.pos.y + obj2.height)) YColl = true;

    // If the player collided both vertically and horizontally..
    return XColl & YColl;

  }

  // If the player crashed into an enemy
  die() {
    if (this.isEnd) return; // Player can die only 1 time
    this.isEnd = true;

    this.player.src = './Images/starship_d100.png'; // Change player's skin

    // Play explosion audio
    let explosion = new Audio();
    explosion.src = './Sounds/explosion.mp3';
    explosion.play();

    // Reload the game
    setTimeout(() => { location.reload() }, 1000);
  }

  // Generating more enemies
  enimiesGen(interval) {

    setInterval(() => {
      Game.addEntity({
        height: 50,
        width: 100,
        src: './Images/UFO.png',
        healf: 100,
        point: 10,
        speed: 3,
        pos: {
          x: this.random(125, Game.cnv.width - 125),
          y: -50
        }
      });
    }, interval);

  }

  // Start the game
  start() {
    // Start enimies generation
    this.enimiesGen(1500);

    // Add controller
    this.controller();

    setInterval(() => this.loop(), 1000 / 60);
  }
}
