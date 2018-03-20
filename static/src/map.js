class Map {
	setArr(arr) {
		this.arr = arr;
	}

	draw(canvas, tileSet, size) {
		let ctx = canvas.getContext('2d');
		canvas.width = 1536;
		canvas.height  = 734;
		ctx.globalAlpha = 1;

		for (let j = 0; j < 16; j++) {
			for (let i = 0; i < 33; i++) {
				switch (this.arr[j][i]) {
					case 0:
						ctx.drawImage(tileSet, 0, 0, size / 2, size / 2, i * size / 2, j * size / 2, size / 2, size / 2);
						break;
					case 1:
						ctx.drawImage(tileSet, size / 2, 0, size / 2, size / 2, i * size / 2, j * size / 2, size / 2, size / 2);
						break;
					case 2:
						ctx.drawImage(tileSet, size, 0, size / 2, size / 2, i * size / 2, j*size / 2, size / 2, size / 2);
						break;
				}
			}
		}
	}
}

export default Map;