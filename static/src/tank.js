let
	getRandomInt = (min, max) => {
		return Math.floor(Math.random() * (max - min)) + min;
	};

class Tank {
	constructor(id, name, type, $arena, game, isLocal, x, y, hp) {
		this.id = id;
		this.name= name;
		this.type = type;
		this.speed = 5;
		this.$arena = $arena;
		this.width = 80;
		this.height = 130;
		this.baseAngle = getRandomInt(0, 360);
		this.baseAngle -= (this.baseAngle % 5);
		this.cannonAngle = 0;
		this.x = x;
		this.y = y;
		this.mx = null;
		this.my = null;
		this.dir = {
			up: false,
			down: false,
			left: false,
			right: false
		};
		this.game = game;
		this.isLocal = isLocal;
		this.hp = hp;
		this.dead = false;

		this.materialize();
	}

	materialize() {
		this.$arena.append('<div id="' + this.id + '" class="tank t-' + this.type + '"></div>');
		this.$body = $('#' + this.id);
		this.$body.css('width', this.width);
		this.$body.css('height', this.height);

		this.$body.css('transform', 'rotateZ(' + this.baseAngle + 'deg)');

		if(this.type === 1) {
			this.$body.append('<div id="cannon-t' + this.id + '" class="tank-cannon1"></div>');
		} else if(this.type === 2) {
			this.$body.append('<div id="cannon-t' + this.id + '" class="tank-cannon2"></div>');
		} else {
			this.$body.append('<div id="cannon-t' + this.id + '" class="tank-cannon3"></div>');
		}

		this.$cannon = $('#cannon-t' + this.id);

		this.$arena.append('<div id="info-i' + this.id + '" class="info"></div>');
		this.$info = $('#info-i' + this.id);
		this.$info.append('<div class="label">' + this.name + '</div>');
		this.$info.append('<progress value="100" max="100" class="hp-bar"></progress>');

		this.refresh();

		if(this.isLocal) {
			this.setControls();
		}
	}

	isMoving() {
		return this.dir.up || this.dir.down || this.dir.left || this.dir.right;
	}

	refresh() {
		this.$body.css('left', this.x - 30 + 'px');
		this.$body.css('top', this.y - 40 + 'px');
		this.$body.css('transform', 'rotateZ(' + this.baseAngle + 'deg)');

		let cannonAbsAngle = this.cannonAngle - this.baseAngle;
		this.$cannon.css('transform', 'rotateZ(' + cannonAbsAngle + 'deg)');

		this.$info.css('left', (this.x) + 'px');
		this.$info.css('top', (this.y) + 'px');
		if(this.isMoving()) {
			this.$info.addClass('fade');
		} else {
			this.$info.removeClass('fade');
		}
		this.$info.find('.hp-bar').css('width', this.hp + 'px');
	}

	setControls() {
		$(document).keydown( (e) => {
			let key = e.keyCode;
			switch(key) {
				case 87:
					this.dir.up = true;
					break;
				case 68:
					this.dir.right = true;
					break;
				case 83:
					this.dir.down = true;
					break;
				case 65:
					this.dir.left = true;
					break;
			}
		}).keyup( (e) => {
			let key = e.keyCode;
			switch(key){
				case 87:
					this.dir.up = false;
					break;
				case 68:
					this.dir.right = false;
					break;
				case 83:
					this.dir.down = false;
					break;
				case 65:
					this.dir.left = false;
					break;
			}
		}).keydown( (e) => {
			let key = e.keyCode;
			switch(key){
				case 38:
					this.dir.up = true;
					break;
				case 39:
					this.dir.right = true;
					break;
				case 40:
					this.dir.down = true;
					break;
				case 37:
					this.dir.left = true;
					break;
			}
		}).keyup( (e) => {
			let key = e.keyCode;
			switch(key){
				case 38:
					this.dir.up = false;
					break;
				case 39:
					this.dir.right = false;
					break;
				case 40:
					this.dir.down = false;
					break;
				case 37:
					this.dir.left = false;
					break;
			}
		}).mousemove( (e) => {
			this.mx = e.pageX - this.$arena.offset().left;
			this.my = e.pageY - this.$arena.offset().top;
			this.setCannonAngle();
		}).click( () => {
			this.shoot();
		});
	}

	move() {
		if(this.dead) return;

		let moveX = 0;
		let moveY = 0;

		if(this.dir.up) {
			moveY = -1;
		} else if(this.dir.down) {
			moveY = 1;
		} else if(this.dir.left) {
			moveX = -1;
		} else if(this.dir.right) {
			moveX = 1;
		}

		moveX *= this.speed;
		moveY *= this.speed;

		if(this.x + moveX > 20 && (this.x + moveX) < (this.$arena.width() - 40)) {
			this.x += moveX;
		}
		if(this.y + moveY > 5 && (this.y + moveY) < (this.$arena.height() - 50)) {
			this.y += moveY;
		}

		if(this.x >= 133 && this.x <= 305 && this.y >= 117 && this.y <= 430) {
			this.x -= moveX;
			this.y -= moveY;
		} else if(this.x >= 130 && this.x <= 590 && this.y >= 480 && this.y <= 670) {
			this.x -= moveX;
			this.y -= moveY;
		} else if(this.x >= 680 && this.x <= 865 && this.y >= 480 && this.y <= 670) {
			this.x -= moveX;
			this.y -= moveY;
		} else if(this.x >= 410 && this.x <= 582 && this.y >= 117 && this.y <= 430) {
			this.x -= moveX;
			this.y -= moveY;
		} else if(this.x >= 582 && this.x <= 740 && this.y >= 260 && this.y <= 430) {
			this.x -= moveX;
			this.y -= moveY;
		} else if(this.x >= 685 && this.x <= 865 && this.y >= 117 && this.y <= 430) {
			this.x -= moveX;
			this.y -= moveY;
		} else if(this.x >= 1005 && this.x <= 1275 && this.y >= 70 && this.y <= 250) {
			this.x -= moveX;
			this.y -= moveY;
		} else if(this.x >= 1005 && this.x <= 1190 && this.y >= 230 && this.y <= 525) {
			this.x -= moveX;
			this.y -= moveY;
		} else if(this.x >= 1005 && this.x <= 1230 && this.y >= 350 && this.y <= 525) {
			this.x -= moveX;
			this.y -= moveY;
		}

		this.rotateBase();
		this.setCannonAngle();
		this.refresh();
	}

	rotateBase() {
		if((this.dir.up && this.dir.left)	|| (this.dir.down && this.dir.right)) {
			this.setDiagonalLeft();
		} else if((this.dir.up && this.dir.right)	|| (this.dir.down && this.dir.left)) {
			this.setDiagonalRight();
		} else if(this.dir.up || this.dir.down) {
			this.setVertical();
		} else if(this.dir.left || this.dir.right) {
			this.setHorizontal();
		}

	}

	setVertical() {
		if(this.baseAngle !== 0 && this.baseAngle !== 180){
			if(this.baseAngle < 90 || (this.baseAngle > 180 && this.baseAngle < 270)){
				this.decreaseBaseRotation();
			}else{
				this.increaseBaseRotation();
			}
		}
	}

	setHorizontal() {
		if(this.baseAngle !== 90 && this.baseAngle !== 270){
			if(this.baseAngle < 90 || (this.baseAngle > 180 && this.baseAngle < 270)) {
				this.increaseBaseRotation();
			} else {
				this.decreaseBaseRotation();
			}
		}
	}

	setDiagonalLeft() {
		if(this.baseAngle !== 135 && this.baseAngle !== 315) {
			if(this.baseAngle < 135 || (this.baseAngle > 225 && this.baseAngle < 315)) {
				this.increaseBaseRotation();
			} else {
				this.decreaseBaseRotation();
			}
		}
	}

	setDiagonalRight() {
		if(this.baseAngle !== 45 && this.baseAngle !== 225){
			if(this.baseAngle < 45 || (this.baseAngle > 135 && this.baseAngle < 225)){
				this.increaseBaseRotation();
			}else{
				this.decreaseBaseRotation();
			}
		}
	}

	increaseBaseRotation() {
		this.baseAngle += 5;
		if(this.baseAngle >= 360){
			this.baseAngle = 0;
		}
	}

	decreaseBaseRotation() {
		this.baseAngle -= 5;
		if(this.baseAngle < 0){
			this.baseAngle = 0;
		}
	}

	setCannonAngle() {
		let tank = { x: this.x , y: this.y};
		let deltaX = this.mx - tank.x - 7;
		let deltaY = this.my - tank.y - 25;
		this.cannonAngle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
		this.cannonAngle += 90;
	}

	shoot() {
		if(this.dead){
			return;
		}

		let serverShell = {};
		serverShell.alpha = this.cannonAngle * Math.PI / 180;

		let cannonLength = 60;
		let deltaX = cannonLength * Math.sin(serverShell.alpha);
		let deltaY = cannonLength * Math.cos(serverShell.alpha);

		serverShell.ownerId = this.id;
		serverShell.x = this.x + deltaX - 5;
		serverShell.y = this.y - deltaY - 5;

		this.game.socket.emit('shoot', serverShell);
	}
}

export default Tank;