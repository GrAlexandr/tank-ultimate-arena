import Tank from './tank';
import Shell from './shell';

class Game {
	constructor(arenaId, w, h, socket) {
		this.tanks = [];
		this.shells = [];
		this.width = w;
		this.height = h;
		this.$arena = $(arenaId);
		this.$arena.css('width', w);
		this.$arena.css('height', h);
		this.socket = socket;

		setInterval(() => {
			this.mainLoop();
		}, 50);
	}

	addTank(id, name, type, isLocal, x, y, hp) {
		let tank = new Tank(id, name, type, this.$arena, this, isLocal, x, y, hp);
		if(isLocal) {
			this.localTank = tank;
		} else {
			this.tanks.push(tank);
		}
	}

	removeTank(tankId) {
		this.tanks = this.tanks.filter( (tank) => {
			return tank.id !== tankId
		});

		$('#' + tankId).remove();
		$('#info-i' + tankId).remove();
	}

	killTank(tank) {
		tank.dead = true;
		this.removeTank(tank.id);

		this.$arena.append('<img id="expl' + tank.id + '" class="explosion" src="./img/fire2.gif"/>');
		this.$arena.append('<img id="exp2' + tank.id + '" class="explosion" src="./img/fire.gif"/>');
		this.$arena.append('<audio id="sound-exp' + tank.id + '" src="sound/exp.mp3" autoplay preload>');
		$('#expl' + tank.id).css('left', (tank.x - 50)  + 'px');
		$('#expl' + tank.id).css('top', (tank.y - 100)  + 'px');
		$('#exp2' + tank.id).css('left', (tank.x - 50)  + 'px');
		$('#exp2' + tank.id).css('top', (tank.y - 100)  + 'px');

		setTimeout(() => {
			$('#expl' + tank.id).remove();
			$('#exp2' + tank.id).remove();
			$('#sound-exp' + tank.id).remove();
		}, 2000);
	}

	mainLoop() {
		if(this.localTank !== undefined) {
			this.sendData();
			this.localTank.move();
		}
	}

	sendData() {
		let gameDataTank = {
			id: this.localTank.id,
			x: this.localTank.x,
			y: this.localTank.y,
			baseAngle: this.localTank.baseAngle,
			cannonAngle: this.localTank.cannonAngle,
		};
		this.socket.emit('sync', gameDataTank);
	}

	receiveData(serverData) {
		serverData.tanks.forEach( (serverTank) => {
			if(this.localTank !== undefined && serverTank.id !== this.localTank.id) {
				if (Math.abs(this.localTank.x - serverTank.x) < 95 && Math.abs(this.localTank.y - serverTank.y) < 95) {
					this.localTank.stop();
				}
			} else if(this.localTank !== undefined && serverTank.id === this.localTank.id) {
				this.localTank.hp = serverTank.hp;
				if(this.localTank.hp <= 0){
					this.killTank(this.localTank);
				}
			}

			let found = false;
			this.tanks.forEach( (clientTank) => {
				if(clientTank.id === serverTank.id) {
					clientTank.x = serverTank.x;
					clientTank.y = serverTank.y;
					clientTank.baseAngle = serverTank.baseAngle;
					clientTank.cannonAngle = serverTank.cannonAngle;
					clientTank.hp = serverTank.hp;
					if (clientTank.hp <= 0) {
						this.killTank(clientTank);
					}
					clientTank.refresh();
					found = true;
				}
			});

			if(!found && (this.localTank === undefined || serverTank.id !== this.localTank.id)) {
				this.addTank(serverTank.id, serverTank.name, serverTank.type, false, serverTank.x, serverTank.y, serverTank.hp);
			}
		});

		this.$arena.find('.cannon-shell').remove();

		serverData.shells.forEach( (serverShell) => {
			let shell = new Shell(serverShell.id, serverShell.ownerId, this.$arena, serverShell.x, serverShell.y);
			shell.exploding = serverShell.exploding;
			if(shell.exploding) {
				shell.explode();
			}
		});
	}
}

export default Game;