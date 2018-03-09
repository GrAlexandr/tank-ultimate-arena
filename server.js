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
app.use(express.static(__dirname + '/static'));

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

class GameServer {
	constructor() {
		this.tanks = [];
		this.shells = [];
		this.lastShellId = 0;
	}

	addTank(tank) {
		this.tanks.push(tank);
	}

	addShell(shell) {
		this.shells.push(shell);
	}

	removeTank(tankId) {
		this.tanks = this.tanks.filter( (tank) =>{
			return tank.id !== tankId;
		});
	}

	syncTank(newTankData) {
		this.tanks.forEach( (tank) => {
			if(tank.id === newTankData.id){
				tank.x = newTankData.x;
				tank.y = newTankData.y;
				tank.baseAngle = newTankData.baseAngle;
				tank.cannonAngle = newTankData.cannonAngle;
			}
		});
	}

	syncShells() {
		this.shells.forEach( (shell) => {
			this.detectCollisionShell(shell);
			if(shell.x < 0 || shell.x > 3000
				|| shell.y < 0 || shell.y > 1500) {
				shell.out = true;
			} else {
				shell.fly();
			}
		});
	}

	detectCollisionShell(shell) {
		this.tanks.forEach( (tank) => {
			if(tank.id !== shell.ownerId && Math.abs(tank.x - shell.x) < 35	&& Math.abs(tank.y - shell.y) < 35) {
				tank.hp -= 2;
				shell.out = true;
				shell.exploding = true;
			}
		});
	}
//===========================================================
	detectCollisionTanks() {
		// this.tanks.forEach( (tank, i, arr) => {
		// 	// console.log('tank: ' + tank + '; number: ' + i + '; array: ' + arr);
		// });
	}
//============================================================

	getData() {
		let gameData = {};
		gameData.tanks = this.tanks;
		gameData.shells = this.shells;

		return gameData;
	}

	cleanDeadTanks() {
		this.tanks = this.tanks.filter( (tank) => {
			return tank.hp > 0;
		});
	}

	cleanDeadShells() {
		this.shells = this.shells.filter( (shell) => {
			return !shell.out;
		});
	}

	increaseLastShellId() {
		this.lastShellId ++;
			if(this.lastShellId > 1000){
				this.lastShellId = 0;
			}
		}
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
		let initX = getRandomInt(40, 130); // 40 * 900
		let initY = getRandomInt(40, 600); //40 * 500
		let tankId = idGenerator();

		client.emit('addTank', { id: tankId, name: tank.name, type: tank.type, isLocal: true, x: initX, y: initY, hp: 100 });
		client.broadcast.emit('addTank', { id: tankId, name: tank.name, type: tank.type, isLocal: false, x: initX, y: initY, hp: 100});

		game.addTank({ id: tankId, name: tank.name, type: tank.type, hp: 100});
	});

	client.on('sync', (data) => {
		if(data.tank !== undefined){
			game.syncTank(data.tank);
		}
		game.syncShells();
		client.emit('sync', game.getData());
		client.broadcast.emit('sync', game.getData());

		game.cleanDeadTanks();
		game.cleanDeadShells();
	});

	client.on('shoot', (sh) =>{
		let shell = new Shell(sh.ownerId, sh.alpha, sh.x, sh.y );
		game.addShell(shell);
	});

	client.on('leaveGame', (tankId) => {
		console.log(tankId + ' left us');
		game.removeTank(tankId);
		client.broadcast.emit('removeTank', tankId);
	});

	//-----------------------------------------
	client.on('eventServer', function (data) {
		console.log(data);
		client.emit('eventClient', { data: 'Hello Client' });
	});
//------------------------------------------

});