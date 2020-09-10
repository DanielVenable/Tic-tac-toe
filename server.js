'use strict';

const { createServer } = require('http'),
	{ promises: { readFile } } = require('fs'),
	port = process.argv[2] || 80,
	file = readFile(__dirname + '/play.html');

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
				res.setHeader('Content-Type', 'text/plain');
				const user = state[1], grid = [...state[2]];
				
				res.end(grid);
			} else res.statusCode = 404;
		} catch {
			res.statusCode = 400;
		}
	} else res.statusCode = 405;
	if (!res.writableEnded) res.end();
}).listen(port, () => console.log(`Server running on http://localhost:${port}`));

function* all_moves(grid, token) {
	let i = grid.length;
	while (i--) if (grid[i] === '_') yield replace_at(grid, token, i);
}

function replace_at(str, char, position) {
	return str.slice(0, position) + char + str.slice(position + 1);
}

function flip(token) {
	return token === 'x' ? 'o' : 'x';
}

function winner(grid) {
	if (grid.length !== 9) console.error('Wrong grid size!');
	for (let is_row = 0; is_row < 2; is_row++) {
		outer: for (let i = 0, j = 0; i < 3; i++) {
			const get_token = is_row ? () => grid[i * 3 + j] : () => grid[j * 3 + i];
			let current = get_token();
			if (current === '_') continue;
			for (j = 1; j < 3; j++) {
				if (get_token() !== current) continue outer;
			}
			return current;
		}
	}
	let current = grid[4]; // center
	if (current === '_') return null;
	return (grid[0] === current && grid[8] === current) ||
		(grid[2] === current && grid[6] === current) ? current : null;
}