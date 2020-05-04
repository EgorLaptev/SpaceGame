class GameCore
{
	constructor(canv) {
		// Creating canvas
		this.cnv = document.getElementById(canv);
		this.ctx = this.cnv.getContext('2d');

		this.cnv.width = window.innerWidth;
		this.cnv.height = window.innerHeight;

		// Other

		this.isEnd = false;
		this.isPause = false;


		this._unities = [];
		this._bullets = [];
		this._pressedKeys = [];

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
			}]; 

		// Player

		this.player = {
			width: 80,
			height: 80,
			color: 'green',
			src: './Images/starship.png',
			speed: 5,
			healf: 100,
			damage: 25,
			score: 0,
			pos: {
				x: this.cnv.width/2 - 40,
				y: this.cnv.height - 180,
			}
		}
		this.controller();
		this.enimiesGen(1500);}
	addUnity(opt) {
		this._unities.push({
			width: opt.width || 100,
			height: opt.height || 100,
			color: opt.color || 'white',
			src: opt.src || '',
			speed: opt.speed || 0,
			healf: opt.healf || 100,
			score: opt.score || 0,
			damage: opt.damage || 0,
			pos: {
				x: opt.pos.x || 0,
				y: opt.pos.y || 0
			}
		});}	
	controller() {
		document.addEventListener('click', ()=>{
			if(this.isEnd || this.isPause) return 0;
			this.attack();
		})
		document.addEventListener('keydown', (e)=>{

			if(e.keyCode == 27) { 
				if(this.isPause) {
					this.isPause = false;
				} else {
					this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
					this.ctx.fillRect(0, 0, this.cnv.width, this.cnv.height);
					this.ctx.fillStyle = '#333';
					this.ctx.font = "64px sans-serif";
					this.ctx.fillText('Pause', this.cnv.width/2-90, this.cnv.height/2)
					this.isPause = true;
				}	
			}

			if(this.isEnd || this.isPause) return 0;
		
			if(e.keyCode == 87 ||
			   e.keyCode == 65 || 
			   e.keyCode == 83 ||
			   e.keyCode == 68) { this._pressedKeys[e.keyCode] = true }
			if(e.keyCode == 32) { this.attack(); }
		});
		document.addEventListener('keyup', (e)=>{
			if(this.isEnd || this.isPause) return 0;
		
			if(e.keyCode == 87 ||
			   e.keyCode == 65 ||
			   e.keyCode == 83 ||
			   e.keyCode == 68) { this._pressedKeys[e.keyCode] = false }
		});
		document.addEventListener('contextmenu', (e)=>{
			e.preventDefault();
		});
		window.addEventListener('blur', ()=>{
			this._pressedKeys = [];
		});}
	draw() {

		this.clear();

		// Background
		{
			if(this.bg.src !== '') {
				for(let i=0;i<2;i++) {
					let bg = new Image(this.cnv.width, this.cnv.height);
					bg.src = this.bg[i].src;
					this.ctx.drawImage(bg, this.bg[i].pos.x, this.bg[i].pos.y, this.cnv.width, this.cnv.height);
				}		
			}
		}

		// Unities
		{
			for(let i=0;i<this._unities.length;i++) {
				this.ctx.beginPath();
				if(this._unities[i].src == '') {
					this.ctx.fillStyle = this._unities[i].color;
					this.ctx.arc(this._unities[i].pos.x, this._unities[i].pos.y, this._unities[i].width, 0, Math.PI*2);
					this.ctx.fill();
				} else {

					let unity = new Image(this._unities[i].width,this._unities[i].height);
					unity.src = this._unities[i].src;
					
					this.ctx.drawImage(unity, this._unities[i].pos.x, this._unities[i].pos.y, unity.width, unity.height);
		

				}
				this.ctx.closePath();

				// Unities healf
				this.ctx.beginPath();

				this.ctx.fillStyle = 'rgba(255,0,0,0.5)';
				this.ctx.rect(this._unities[i].pos.x, this._unities[i].pos.y-15, this._unities[i].healf, 5);
				this.ctx.fill();

				this.ctx.closePath();
					
			}}

		// Player 
		{
			let unity = new Image(this.player.width,this.player.height);
			unity.src = this.player.src;
					
			this.ctx.drawImage(unity, this.player.pos.x, this.player.pos.y, unity.width, unity.height);			}

		// Bullets
		{
			for(let i=0;i<this._bullets.length;i++) {
				this.ctx.beginPath();

				this.ctx.fillStyle = this._bullets[i].color;
				this.ctx.rect(this._bullets[i].pos.x, this._bullets[i].pos.y, this._bullets[i].width, this._bullets[i].height);
				this.ctx.fill();			

				this.ctx.closePath();}}

		// player's HP 
		/*{
			this.ctx.beginPath();
			this.ctx.fillStyle = 'rgba(255,0,0,.7)';
			this.ctx.rect(25,25,this.player.healf,25);
			this.ctx.fill();
			this.ctx.closePath();
			this.ctx.beginPath();
			this.ctx.strokeStyle = '#333';
			this.ctx.lineWidth = 2;
			this.ctx.rect(25, 25, 150, 25);
			this.ctx.stroke();
			this.ctx.closePath();
			this.ctx.beginPath();
			this.ctx.font = "bold 25px sans-serif";
			this.ctx.fillStyle = '#333';
			this.ctx.fillText('HP', 83, 47);
			this.ctx.closePath();
		}*/}
	move() {
		// Player
	
		if(this._pressedKeys[87] && this.player.pos.y > 0) this.player.pos.y-=this.player.speed // Up
		if(this._pressedKeys[83] && this.player.pos.y < this.cnv.height-this.player.height) this.player.pos.y+=this.player.speed // Down
		if(this._pressedKeys[65] && this.player.pos.x > 0) this.player.pos.x-=this.player.speed // Left
		if(this._pressedKeys[68] && this.player.pos.x < this.cnv.width-this.player.width) this.player.pos.x+=this.player.speed // Right
	

		// Unities
		for(let i=0;i<this._unities.length;i++) {
			this._unities[i].pos.x+=this._unities[i].speed;
			if(this._unities[i].pos.x <= 25 ||
			   this._unities[i].pos.x >= this.cnv.width-this._unities[i].width-25) {
				this._unities[i].speed = -this._unities[i].speed;
			}

			this._unities[i].pos.y += 2;

			if(this._unities[i].pos.y >= this.cnv.height) this._unities.splice(i, 1);

			if(this.UnityCollision(this._unities[i], this.player)) this.end(); 
		}

		// Bullets
		for(let i=0;i<this._bullets.length;i++) {
		 	this._bullets[i].pos.x = this.player.pos.x+this.player.width/2-2;
		 	this._bullets[i].pos.y = -(this.cnv.height-this.player.pos.y);
		}

		// Background
		for(let i=0;i<2;i++) {
			if(this.bg[i].pos.y >= this.cnv.height) this.bg[i].pos.y = -this.cnv.height;
			this.bg[i].pos.y+=2
		};}
	loop() {
		if(this.isPause) return;
		this.move();
		this.draw();}
	random(min, max) { return Math.random() * (max - min) + min;}
	attack() {
		let laserAudio = new Audio();
		laserAudio.src = './Sounds/laser.mp3';
		laserAudio.play();

		this._bullets.push({
			damage: this.player.damage,
			width: 4,
			height: this.cnv.height,
			color: 'lime',
			pos: {
				x: this.player.pos.x+this.player.width/2-2,
				y: -(this.cnv.height-this.player.pos.y)
			}
		});

		for(let i=0;i<this._unities.length;i++) {
			if(this._unities[i].pos.x < this._bullets[this._bullets.length-1].pos.x && this._unities[i].pos.x+this._unities[i].width > this._bullets[this._bullets.length-1].pos.x) {
				this._unities[i].healf -= this._bullets[this._bullets.length-1].damage;
				if(this._unities[i].healf <= 0) {

					let explosion = new Audio();
					explosion.src = './Sounds/explosion.mp3'
					explosion.play();

					this.player.score += this._unities[i].score;
					this._unities.splice(i, 1);
				};
			}
		}
		setTimeout(()=>{
			this._bullets.shift();
		}, 100);}
	UnityCollision(obj1,obj2){
		  var XColl=false;
		  var YColl=false;

		  if ((obj1.pos.x + obj1.width >= obj2.pos.x) && (obj1.pos.x <= obj2.pos.x + obj2.width)) XColl = true;
		  if ((obj1.pos.y + obj1.height >= obj2.pos.y) && (obj1.pos.y <= obj2.pos.y + obj2.height)) YColl = true;

		  if (XColl&YColl){return true;}
		  return false;}
	clear() { this.ctx.clearRect(0, 0, this.cnv.width, this.cnv.height) }
	end() {
		if(this.isEnd) return;
		this.isEnd = true;
		this.player.src = './Images/starship_d100.png';
		let explosion = new Audio();
		explosion.src = './Sounds/explosion.mp3';
		explosion.play();
		setTimeout(()=>{
			location.reload(); 
		}, 1000);}
	enimiesAttack(enemy) {
		this._bullets.push({
			width: 5,
			height: this.cnv.height,
			color: 'red',
			pos: {
				x: enemy.pos.x+enemy.width/2,
				y: enemy.pos.y+enemy.height
			}
		});}
	enimiesGen(interval, lvl) {
		setInterval(()=>{
			Game.addUnity({
			height: 50,
			width: 100,
			src: './Images/UFO.png',
			healf: 100,
			score: 10,
			speed: 3,
			pos: {
				x: this.random(125, Game.cnv.width-125),
				y: -50
			}});
		}, interval);}
	start() { 

		let gameSound = new Audio();
		gameSound.src = './Sounds/gameSound.mp3';

		setInterval(()=>this.loop(), 1000/60); 
	}
}