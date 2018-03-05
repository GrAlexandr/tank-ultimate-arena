const
	width = window.innerWidth,
	height = window.innerHeight;

let
	// socket = io.connect('https://tank-ultimate-arena.herokuapp.com/'),
	socket = io.connect('localhost:3000'),
	game = new Game('#arena', width, height, socket),
	tankType = 1,
	tankName = '',
	joinGame = (tankName, tankType, socket) => {
		if(tankName !== ''){
			$('.form').hide();
			socket.emit('joinGame', {name: tankName, type: tankType});
		}
	};

socket.on('addTank', (tank) => {
	game.addTank(tank.id, tank.name, tank.type, tank.isLocal, tank.x, tank.y);
});
//-----------------------------------------
socket.on('eventClient', function (data) {
	console.log(data);
});
socket.emit('eventServer', { data: 'Hello Server' });
//----------------------------------------
socket.on('sync', (gameServerData) => {
	game.receiveData(gameServerData);
});

socket.on('killTank', (tankData) => {
	game.killTank(tankData);
});

socket.on('removeTank', (tankId) => {
	game.removeTank(tankId);
});

$(document).ready( () => {
	$('#btn').mouseover( () => {
		$('#sound-fon').animate({opacity: 'toggle', height: 'toggle'}, 1000);
		// console.log(document.getElementById('btn').innerHTML);
		// if($('#btn').css('display') === 'none') {
			$('#btn').html('&raquo;');
			$('#btn').css("opacity", 0.5);
		// } else {
		// 	$('#btn').html('&laquo;');
		// 	$('#btn').css("opacity", 1);
		// }
	});

	$('.btn').click( () => {
		tankName = $('.tank-name').val();
		joinGame(tankName, tankType, socket);
	});

	$('.tank-name').keyup( (e) => {
		tankName = $('.tank-name').val();
		let key = e.keyCode;
		if(key === 13){
			joinGame(tankName, tankType, socket);
		}
	});

	$('ul.tank-selection li').click( function() {
		$('.tank-selection li').removeClass('selected');
		$(this).addClass('selected');
		tankType = $(this).data('tank');
	});

	$(document).keyup( (e) => {
		let key = e.keyCode;
		switch(key) {
			case 39:
				if( $("li:first-child").attr("class") === 'selected' ) {
					$('li:first-child').removeClass('selected');
					$('li:nth-child(2)').addClass('selected');
					tankType = $('li:nth-child(2)').data('tank');
					break;
				}
			if( $("li:nth-child(2)").attr("class") === 'selected' ) {
				$('li:nth-child(2)').removeClass('selected');
				$('li:last-child').addClass('selected');
				tankType = $('li:last-child').data('tank');
				break;
			}
			break;
			case 37:
				if( $("li:nth-child(2)").attr("class") === 'selected' ) {
					$('li:nth-child(2)').removeClass('selected');
					$('li:first-child').addClass('selected');
					tankType = $('li:first-child').data('tank');
					break;
				}
				if( $("li:last-child").attr("class") === 'selected' ) {
					$('li:last-child').removeClass('selected');
					$('li:nth-child(2)').addClass('selected');
					tankType = $('li:nth-child(2)').data('tank');
					break;
				}
			break;
		}
	});
});

$(window).on('unload', () => {
	socket.emit('leaveGame', tankName);
});