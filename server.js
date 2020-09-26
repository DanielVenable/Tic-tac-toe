'use strict';

process.chdir(__dirname);

const { createServer } = require('http'),
	{ promises: { readFile } } = require('fs'),
	decide_move = require('./game-decide-move.js'),
	Move_tree = decide_move(all_moves),
	id = decide_move.gamestateID,
	port = process.argv[2] || 80,
	file = readFile('./play.html');

createServer(async (req, res) => {
	if (req.method === 'GET') {
		try {
			const url = req.url.split('?')[0];
			let state;
			res.statusCode = 200;
			if (url === '/') {
				res.setHeader('Content-Type', 'text/html');
				res.end(await file);
			} else if (state = url.match(/^[/]([xo])[/]([xo_]{9})$/)) {
				res.setHeader('Content-Type', 'application/json');

				const obj = {
					grid: state[2],
					token: state[1],
					[id]: state[2] + state[1]
				}
				get_winner(obj);

				const tree = new Move_tree(obj);

				let score_list = new Set(tree.children);
				for (const item of score_list) {
					if (item.value.score !== undefined) score_list.delete(item);
				}

				while (!score_list[Symbol.iterator]().next().done) {
					for (const item of score_list) {
						let is_all_scored = true;
						for (const child of item.children) {
							if (child.value.score === undefined) {
								is_all_scored = false;
								score_list.add(child);
							}
						}
						if (is_all_scored) {
							score_by_children(item);
							score_list.delete(item);
						}
					}
				}

				let best = [], best_score = -Infinity;
				for (const child of tree.children) {
					if (child.value.score > best_score) {
						best = [child];
						best_score = child.value.score;
					} else if (child.value.score === best_score) best.push(child);
				}

				const move = best[Math.floor(Math.random() * best.length)];

				res.end(JSON.stringify(move ? {
					grid: move.value.grid,
					winner: move.value.winner
				} : {
					winner: tree.value.winner
				}));
			} else res.statusCode = 404;
		} catch (e) {
			res.statusCode = 400;
			console.error(e);
		}
	} else res.statusCode = 405;
	if (!res.writableEnded) res.end();
}).listen(port, () => console.log(`Server running on http://localhost:${port}`));

function* all_moves({ grid, token, winner }) {
	if (winner) return;
	for (var i = 0; i < grid.length; i++) {
		if (grid[i] === '_') yield get_move(grid, token, i);
	}
}

function get_move(grid, token, position) {
	const obj = {
		grid: grid.slice(0, position) + token + grid.slice(position + 1),
		token: token === 'x' ? 'o' : 'x',
	};
	obj[id] = obj.grid + obj.token;
	get_winner(obj);
	return obj;
}

function get_winner(obj) {
	const win = winner(obj.grid);
	if (win) {
		obj.winner = win;
		if (win === '_') obj.score = 0;
		else obj.score = obj.token === win ? -1 : 1;
	}
}

function winner(grid) {
	for (let is_row = 0; is_row < 2; is_row++) {
		let i, j;
		const get_token = is_row ? () => grid[i * 3 + j] : () => grid[j * 3 + i];
		outer: for (i = 0; i < 3; i++) {
			j = 0;
			const current = get_token();
			if (current === '_') continue;
			for (j = 1; j < 3; j++) {
				if (get_token() !== current) continue outer;
			}
			return current;
		}
	}
	const current = grid[4]; // center
	if (current !== '_' && (
		(grid[0] === current && grid[8] === current) ||
		(grid[2] === current && grid[6] === current))) return current;
	if (!grid.includes('_')) return '_';
}

function score_by_children(node) {
	node.value.score = -Math.max(...node.children.map(child => child.value.score));
}