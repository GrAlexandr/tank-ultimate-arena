import Map from './map';
import mapArray from './mapArray';
import drawTiles from './tiles';


export default function init(size) {
	const
		widthCanvas = 1536,
		heightCanvas = 734;

	let canvas = document.getElementById("game");
		canvas.width  = widthCanvas;
		canvas.height = heightCanvas;
	let context = canvas.getContext("2d");
		context.fillStyle = "#957747";
		context.fillRect(0, 0, canvas.width, canvas.height);
	let tileSetBuffer = document.createElement("canvas");

	drawTiles(tileSetBuffer, size);

	let mapBuffer = document.createElement("canvas");

	let field = new Map();
		field.setArr(mapArray);
		field.draw(canvas, tileSetBuffer, size);

		context.save();
		context.translate(size / 2, size / 2);
		context.drawImage (mapBuffer, 0, 0);
		context.restore();
};