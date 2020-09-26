'use strict';

const id = Symbol('gamestate ID');

module.exports = allmoves => {
	const data = new Map,
		expand = Symbol('expand');

	class TreeNode {
		constructor(value) {
			this.value = value;
		}

		set children(value) {
			data.set(this.value[id], value);
		}

		get children() {
			return data.get(this.value[id]) || this[expand]();
		}

		get has_chlidren() {
			return data.has(this.value[id]);
		}

		get_layer(layer) {
			let current = [this];
			for (var i = 0; i < layer; i++) {
				let new_current = [];
				for (const item of current) {
					new_current.push(item.children);
				}
				current = new_current;
			}
			return current;
		}

		[expand]() {
			const children = [];
			for (const elem of allmoves(this.value)) {
				children.push(new TreeNode(elem));
			}
			return this.children = children;
		}
	}

	return TreeNode;
}

module.exports.gamestateID = id;