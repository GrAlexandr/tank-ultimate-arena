import Game from './game';
import init from './init';
import mapArray from './mapArray';
import $ from 'jquery';
import io from 'socket.io-client';

const
	width = 1536,
	height = 734,
	socket = io('http://localhost:3000');
	// socket = io('https://tank-ultimate-arena.herokuapp.com/');

let
	game = new Game('#arena', width, height, socket),
	tankType = 1,
	tankName = '',
	joinGame = (tankName, tankType, socket) => {
		if(tankName !== ''){
			$('.form').hide();
			socket.emit('joinGame', {name: tankName, type: tankType});
		}
	};

init (92);

socket.on('addTank', (tank) => {
	game.addTank(tank.id, tank.name, tank.type, tank.isLocal, tank.x, tank.y);
});

socket.on('sync', (gameServerData) => {
	game.receiveData(gameServerData);
});

socket.on('removeTank', (tankId) => {
	game.removeTank(tankId);
});

socket.emit('mapArray', mapArray);

$(window).on('unload', () => {
	socket.emit('leaveGame', tankName);
});

$(document).ready( () => {
	$('#btn').mouseover( () => {
		$('#sound-fon').animate({opacity: 'toggle', height: 'toggle'}, 1000);
			$('#btn').html('&raquo;');
			$('#btn').css("opacity", 0.5);
	});

	$('.btn').click( () => {
		$('#sound-fon')[0].play();
		$('#arena').css('display','block');
		$('body').css('background','#957747');
		tankName = $('.tank-name').val();
		joinGame(tankName, tankType, socket);
	});

	$('.tank-name').keyup( (e) => {
		tankName = $('.tank-name').val();
		let key = e.keyCode;
		if(key === 13){
			$('#sound-fon')[0].play();
			$('#arena').css('display','block');
			$('body').css('background','#957747');
			$("li:first-child").attr('class', 'selected');
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
				if( $('li:first-child').attr('class') === 'selected' ) {
					$('li:first-child').removeClass('selected');
					$('li:nth-child(2)').addClass('selected');
					tankType = $('li:nth-child(2)').data('tank');
					break;
				}
			if( $('li:nth-child(2)').attr('class') === 'selected' ) {
				$('li:nth-child(2)').removeClass('selected');
				$('li:last-child').addClass('selected');
				tankType = $('li:last-child').data('tank');
				break;
			}
			break;
			case 37:
				if( $('li:nth-child(2)').attr('class') === 'selected' ) {
					$('li:nth-child(2)').removeClass('selected');
					$('li:first-child').addClass('selected');
					tankType = $('li:first-child').data('tank');
					break;
				}
				if( $('li:last-child').attr('class') === 'selected' ) {
					$('li:last-child').removeClass('selected');
					$('li:nth-child(2)').addClass('selected');
					tankType = $('li:nth-child(2)').data('tank');
					break;
				}
			break;
		}
	});
});

// $('#arena').click( function (event) {
// 	console.log(this.value = event.clientX + ':' + event.clientY);
// });