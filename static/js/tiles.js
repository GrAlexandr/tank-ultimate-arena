let drawTiles = (canvas) => {
		let context = canvas.getContext('2d');
		    context.globalAlpha = 1;

		let empty = () => {
			context.fillStyle = '#957747';
			context.fillRect(0, 0, size / 2, size / 2);
		};

		let brick = () => {
			context.fillStyle = "#ff8f16";
			context.fillRect(0, 0, size / 2, size / 2);

			context.fillStyle = "#808080";
			context.fillRect(0, 0, size / 2, size / 16);
			context.fillRect(0, size / 4, size / 2, size / 16);
			context.fillRect(size / 4, 0, size / 16, size / 4);
			context.fillRect(size / 16, size / 4, size / 16, size / 4);

			context.fillStyle = "#c0c0c0";
			context.fillRect(0, 3 * size / 16, size / 2, size / 16);
			context.fillRect(0, 7 * size / 16, size / 2, size / 16);
			context.fillRect(3 * size / 16, 0, size / 16, size / 4);
			context.fillRect(0, 3 * size / 16, size / 16, size / 4);
		};

		let hBrick = () => {
			context.fillStyle = "#c0c0c0";
			context.fillRect(0, 0, size / 2, size / 2);

			context.fillStyle = "#808080";
			context.beginPath();
			context.moveTo(0, size / 2);
			context.lineTo(size / 2, size / 2);
			context.lineTo(size / 2, 0);
			context.fill();  

			context.fillStyle = "#fff";
			context.fillRect(size / 8, size / 8, size / 4, size / 4);
		};
	    canvas.width  = 3 * size / 2;
	    canvas.height = size / 2;

		context.save();
				empty(0, 0);
			context.translate(size / 2, 0);
				brick(size / 2, 0);
			context.translate(size / 2, 0);
				hBrick(size, 0);
		context.restore();
};