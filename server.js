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
	console.log('Server running at port' + port);
});

let
	counter = 0,
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
		this.lastBallId = 0;
	}

	addTank(tank) {
		this.tanks.push(tank);
	}

	addShell(shell) {
		this.shells.push(shell);
	}

	removeTank(tankId) {
		this.tanks = this.tanks.filter( (t) =>{
			return t.id !== tankId;
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
			this.detectCollision(shell);
			if(shell.x < 0 || shell.x > 5000
				|| shell.y < 0 || shell.y > 3000) {
				shell.out = true;
			} else {
				shell.fly();
			}
		});
	}

	//ОБНАРУЖИВАТЬ СТОЛКНОВЕНИЯ!!!
	detectCollision(shell) {
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
		this.tanks = this.tanks.filter((t) => {
			return t.hp > 0;
		});
	}

	cleanDeadBalls() {
		this.shells = this.shells.filter((shell) => {
			return !shell.out;
		});
	}

	increaseLastBallId() {
		this.lastBallId ++;
			if(this.lastBallId > 1000){
				this.lastBallId = 0;
			}
		}
}

class Shell {
	constructor(ownerId, alpha, x, y) {
		this.id = game.lastBallId;
		game.increaseLastBallId();
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
		console.log(tank.name + ' joined the game');
		let initX = getRandomInt(40, 900);
		let initY = getRandomInt(40, 500);
		let tankId = idGenerator();

		client.emit('addTank', { id: tankId, name: tank.name, type: tank.type, isLocal: true, x: initX, y: initY, hp: 100 });
		client.broadcast.emit('addTank', { id: tankId, name: tank.name, type: tank.type, isLocal: false, x: initX, y: initY, hp: 100} );

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
		game.cleanDeadBalls();
		counter ++;
	});

	client.on('shoot', (sh) =>{
		let shell = new Shell(sh.ownerId, sh.alpha, sh.x, sh.y );
		game.addShell(shell);
	});

	client.on('leaveGame', (tankId) => {
		console.log(tankId + ' has left the game');
		game.removeTank(tankId);
		client.broadcast.emit('removeTank', tankId);
	});

});