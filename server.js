const
	express = require('express'),
	app = express(),
	http = require('http'),
	server = http.Server(app),
	path = require('path'),
	socketIO = require('socket.io'),
	io = socketIO(server),
 	port = process.env.PORT || 3000;

app.set('port', port);
app.use(express.static(__dirname + '/static/dist'));

server.listen(port, () => {
	console.log(`Server listening on port ${port}`);
});

let
	getRandomInt = (min, max) => {
		return Math.floor(Math.random() * (max - min)) + min;
	},
	idGenerator = () => {
		let iD = () => {
			return Math.floor((1 + Math.random()) * 0x10000)
				.toString(16)
				.substring(1);
		};
		return ( iD() + iD() + '-' + iD() + '-' + iD() + iD() + iD() );
	};
	initialPositionTank = () => {
		let randomCoord = getRandomInt(1, 4);
		let init = {};
		if (randomCoord === 1) {
			init.x = getRandomInt(20, 120);
			init.y = getRandomInt(10, 650);
		} else if (randomCoord === 2) {
			init.x = getRandomInt(1270, 1470);
			init.y = getRandomInt(300, 600);
		} else if (randomCoord === 3) {
			init.x = getRandomInt(900, 1000);
			init.y = getRandomInt(10, 600);
		} else if (randomCoord === 4) {
			init.x = getRandomInt(250, 950);
			init.y = getRandomInt(430, 500);
		}
		return init;
	};

class GameServer {
	constructor() {
		this.tanks = [];
		this.shells = [];
		this.mapArray = [];
		this.lastShellId = 0;
		this.size = 92;
		this.widthTank = 75;
		this.heightTank = 130;
	}

	addShell(shell) {
		this.shells.push(shell);
	}

	addTank(tank) {
		this.tanks.push(tank);
	}

	addMapArray(arr) {
		this.mapArray = arr;
	}

	removeTank(tankId) {
		this.tanks = this.tanks.filter((tank) => {
			return tank.id !== tankId;
		});
	}

	syncTank(newTank) {
		this.tanks.forEach((tank) => {
			if (tank.id === newTank.id) {
				tank.x = newTank.x;
				tank.y = newTank.y;
				tank.baseAngle = newTank.baseAngle;
				tank.cannonAngle = newTank.cannonAngle;
			}
		});
	}

	syncShells() {
		this.shells.forEach((shell) => {
			this.detectCollisionShell(shell);
			this.detectCollisionShellWall(shell);
			if (shell.x < 0 || shell.x > 1550
				|| shell.y < 0 || shell.y > 750) {
				shell.out = true;
			} else {
				shell.fly();
			}
		});
	}

	detectCollisionShell(shell) {
		this.tanks.forEach((tank) => {
			if (tank.id !== shell.ownerId && Math.abs(tank.x - shell.x) < 35 && Math.abs(tank.y - shell.y) < 35) {
				tank.hp -= 2;
				shell.out = true;
				shell.exploding = true;
			}
		});
	}

	detectCollisionShellWall(shell) {
		this.mapArray.forEach((cell, r) => {
			this.mapArray[r].forEach((cell, c) => {
				let wallX = ( c * (this.size / 2) ),
					wallY = ( r * (this.size / 2) );
				if (this.mapArray[r][c] === 1 || this.mapArray[r][c] === 2) {
					if (Math.abs(wallX - shell.x) <= 20 && Math.abs(wallY - shell.y) <= 20) {
						shell.out = true;
						shell.exploding = true;
					}
					if (Math.abs((wallX + this.size / 2) - shell.x) <= 5 && Math.abs((wallY + this.size / 2) - shell.y) <= 5) {
						shell.out = true;
						shell.exploding = true;
					}
				}
			});
		});
	}

	getData() {
		let gameData = {};
		gameData.tanks = this.tanks;
		gameData.shells = this.shells;
		return gameData;
	}

	cleanDeadTanks() {
		this.tanks = this.tanks.filter((tank) => {
			return tank.hp > 0;
		});
	}

	cleanDeadShells() {
		this.shells = this.shells.filter((shell) => {
			return !shell.out;
		});
	}

	increaseLastShellId() {
		this.lastShellId++;
		if (this.lastShellId > 1000) {
			this.lastShellId = 0;
		}
	}

	// initialPositionTank() {
	// 	let init = {};
	// 	init.x = getRandomInt(40, 1400);
	// 	init.y = getRandomInt(20, 600);
	// 		for (let r = 0; r < this.mapArray.length; r++) {
	// 			for (let c = 0; c < this.mapArray[r].length; c++) {
	// 				let wallX = ( c * (this.size / 2) ),
	// 						wallY = ( r * (this.size / 2) );
	// 				if(this.mapArray[r][c] === 1 || this.mapArray[r][c] === 2) {
	// 					if (wallX > init.x - this.heightTank && wallY > init.y - this.widthTank || wallX + this.size / 2 < init.x + this.heightTank * 1.5 && wallY + this.size / 2 < init.y + this.widthTank * 1.5) {
	// 						return init;
	// 					} else {
	// 						init.x = getRandomInt(40, 1400);
	// 						init.y = getRandomInt(20, 600);
	// 						--r;
	// 					}
	// 				}
	// 			}
	// 		}
	// }

	// initialPositionTank() {
	// 	let init = {};
	// 	init.x = getRandomInt(40, 1400);
	// 	init.y = getRandomInt(20, 600);
	// 	this.mapArray.forEach( (cell, r) => {
	// 		this.mapArray[r].forEach( (cell, c) => {
	// 			let wallX = ( c * (this.size / 2) ),
	// 				wallY = ( r * (this.size / 2) ),
	// 				paddingX = 25,
	// 				paddingY = 15;
	// 			if(this.mapArray[r][c] === 1 || this.mapArray[r][c] === 2) {
	// 				if (wallX + this.size / 2 > init.x - paddingX * 1.5 && wallX + this.size / 2 < init.x + this.widthTank + paddingX && wallY + this.size / 2 > init.y - paddingY * 1.2 && wallY + this.size / 2 < init.y + this.heightTank - paddingY) {
	// 					return init;
	// 				} else {
	// 					return init = {
	// 						x: getRandomInt(20, 120),
	// 						y: getRandomInt(10, 650)
	// 					};
	// 				}
	// 			}
	// 		});
	// 	});
	// }
}

class Shell {
	constructor(ownerId, alpha, x, y) {
		this.id = game.lastShellId;
		game.increaseLastShellId();
		this.ownerId = ownerId;
		this.alpha = alpha;
		this.x = x;
		this.y = y;
		this.out = false;
	}

	fly(){
		let speedX = 30 * Math.sin(this.alpha);
		let speedY = -30 * Math.cos(this.alpha);
		this.x += speedX;
		this.y += speedY;
	}
}

let game = new GameServer();

io.on('connection', (client) => {
	console.log('User connected');

	client.on('joinGame', (tank) => {
		console.log(tank.name + ' in game');

		// let init = game.initialPositionTank();
		let init = initialPositionTank();
		let tankId = idGenerator();

		client.emit('addTank', { id: tankId, name: tank.name, type: tank.type, isLocal: true, x: init.x, y: init.y, hp: 100 });
		client.broadcast.emit('addTank', { id: tankId, name: tank.name, type: tank.type, isLocal: false, x: init.x, y: init.y, hp: 100});

		game.addTank({ id: tankId, name: tank.name, type: tank.type, hp: 100});
	});

	client.on('sync', (dataTank) => {
		if(dataTank !== undefined){
			game.syncTank(dataTank);
		}
		game.syncShells();
		client.emit('sync', game.getData());
		client.broadcast.emit('sync', game.getData());

		game.cleanDeadTanks();
		game.cleanDeadShells();
	});

	client.on('shoot', (sh) => {
		let shell = new Shell(sh.ownerId, sh.alpha, sh.x, sh.y );
		game.addShell(shell);
	});

	client.on('mapArray', (mapArray) => {
		game.addMapArray(mapArray);
	});

	client.on('leaveGame', (tankId) => {
		console.log(tankId + ' left us');
		game.removeTank(tankId);
		client.broadcast.emit('removeTank', tankId);
	});

});