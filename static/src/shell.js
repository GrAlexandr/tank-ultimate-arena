import $ from 'jquery';

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
		this.$body.css('left', this.x + 10 + 'px');
		this.$body.css('top', this.y + 30 + 'px');
	}

	explode() {
		this.$arena.append('<div id="expl' + this.id + '" class="shell-explosion"></div>');
		let $expl = $('#expl' + this.id);
		$expl.css('left', this.x + 10 + 'px');
		$expl.css('top', this.y + 30 + 'px');

		setTimeout( () => {
			$expl.addClass('expand');
		}, 1);

		setTimeout( () => {
			$expl.remove();
		}, 1000);
	}
}

export default Shell;