const
	width = window.innerWidth,
	height = window.innerHeight;

let
	socket = io.connect('https://tank-ultimate-arena.herokuapp.com/'),
	game = new Game('#arena', width, height, socket),
	selectedTank = 1,
	tankName = '',
	joinGame = (tankName, tankType, socket) => {
		if(tankName !== ''){
			$('#prompt').hide();
			socket.emit('joinGame', {name: tankName, type: tankType});
		}
	};

socket.on('addTank', (tank) => {
	game.addTank(tank.id, tank.name, tank.type, tank.isLocal, tank.x, tank.y);
});

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

	$('#join').click( () => {
		tankName = $('#tank-name').val();
		joinGame(tankName, selectedTank, socket);
	});

	$('#tank-name').keyup( (e) => {
		tankName = $('#tank-name').val();
		let key = e.keyCode;
		if(key === 13){
			joinGame(tankName, selectedTank, socket);
		}
	});

	$('ul.tank-selection li').click( function() {
		$('.tank-selection li').removeClass('selected');
		$(this).addClass('selected');
		selectedTank = $(this).data('tank');
	});

	$(document).keyup( (e) => {
		let key = e.keyCode;
		switch(key) {
			case 39:
				if( $("li:first-child").attr("class") === 'selected' ) {
					$('li:first-child').removeClass('selected');
					$('li:nth-child(2)').addClass('selected');
					selectedTank = $('li:nth-child(2)').data('tank');
					break;
				}
			if( $("li:nth-child(2)").attr("class") === 'selected' ) {
				$('li:nth-child(2)').removeClass('selected');
				$('li:last-child').addClass('selected');
				selectedTank = $('li:last-child').data('tank');
				break;
			}
			break;
			case 37:
				if( $("li:nth-child(2)").attr("class") === 'selected' ) {
					$('li:nth-child(2)').removeClass('selected');
					$('li:first-child').addClass('selected');
					selectedTank = $('li:first-child').data('tank');
					break;
				}
				if( $("li:last-child").attr("class") === 'selected' ) {
					$('li:last-child').removeClass('selected');
					$('li:nth-child(2)').addClass('selected');
					selectedTank = $('li:nth-child(2)').data('tank');
					break;
				}
			break;
		}
	});
});

$(window).on('beforeunload', () => {
	socket.emit('leaveGame', tankName);
});