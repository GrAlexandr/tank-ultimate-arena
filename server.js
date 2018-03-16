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

	syncTank(newTank) {
		this.tanks.forEach( (tank) => {
			if(tank.id === newTank.id) {
				tank.x = newTank.x;
				tank.y = newTank.y;
				tank.baseAngle = newTank.baseAngle;
				tank.cannonAngle = newTank.cannonAngle;
			}
		});
	}

	syncShells() {
		this.shells.forEach( (shell) => {
			this.detectCollisionShell(shell);
			if(shell.x < 0 || shell.x > 1536
				|| shell.y < 0 || shell.y > 734) {
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

		let randomCoord = getRandomInt(1, 4);
		let initX;
		let initY;
		if(randomCoord === 1) {
			initX = getRandomInt(20, 120);
			initY = getRandomInt(10, 700);
		} else if(randomCoord === 2) {
			initX = getRandomInt(1270, 1470);
			initY = getRandomInt(300, 600);
		} else if(randomCoord === 3) {
			initX = getRandomInt(900, 1000);
			initY = getRandomInt(10, 600);
		} else if(randomCoord === 4) {
			initX = getRandomInt(250, 950);
			initY = getRandomInt(430, 500);
		}

		let tankId = idGenerator();

		client.emit('addTank', { id: tankId, name: tank.name, type: tank.type, isLocal: true, x: initX, y: initY, hp: 100 });
		client.broadcast.emit('addTank', { id: tankId, name: tank.name, type: tank.type, isLocal: false, x: initX, y: initY, hp: 100});

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
	// client.on('eventServer', function (data) {
	// 	console.log(data);
	// 	client.emit('eventClient', { data: 'Hello Client' });
	// 	// client.emit('eventClient', );
	// });
//------------------------------------------

});