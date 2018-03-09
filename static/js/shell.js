class Shell {
	constructor(id, ownerId, $arena, x, y) {
		this.id = id;
		this.ownerId = ownerId;
		this.$arena = $arena;
		this.x = x;
		this.y = y;

		this.materialize();
	}

	materialize() {
		this.$arena.append('<div id="' + this.id + '" class="cannon-shell"></div>');
		this.$body = $('#' + this.id);
		this.$body.css('left', this.x + 10 + 'px'); //add 10
		this.$body.css('top', this.y + 30 + 'px'); //add 30
	}

	explode() {
		this.$arena.append('<div id="expl' + this.id + '" class="shell-explosion"></div>');
		let $expl = $('#expl' + this.id);
		$expl.css('left', this.x + 10 + 'px'); //add 10
		$expl.css('top', this.y + 30 + 'px'); //add 30

		setTimeout( () => {
			$expl.addClass('expand');
		}, 1);

		setTimeout( () => {
			$expl.remove();
		}, 1000);
	}
}