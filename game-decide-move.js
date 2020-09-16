'use strict';

module.exports = (allmoves, postition_score) => {
	let data = new Map;

	class TreeNode {
		constructor(value) {
			this.value = value;
		}

		set chlidren(value) {
			return data.set(this.value, value);
		}

		get chlidren() {
			return data.get(this.value) || this.#expand();
		}

		get has_chlidren() {
			return data.has(this.value);
		}

		get_layer(layer) {
			let current = [this];
			for (var i = 0; i < layer; i++) {
				let new_current = [];
				for (const item of current) {
					new_current.push(item.chlidren);
				}
				current = new_current;
			}
			return current;
		}

		#expand() {
			if (!this.has_chlidren) {
				this.chlidren = allmoves(this.value).map(elem => new TreeNode(elem));
			}
		}
	}

	return TreeNode;
}