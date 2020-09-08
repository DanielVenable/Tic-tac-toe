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
			} else if (state = url.match(/^[/]([xo_]{9})$/)) {
				res.setHeader('Content-Type', 'text/plain');
				
			}
		} catch {
			res.statusCode = 400;
		}
	} else res.statusCode = 405;
	if (!res.writableEnded) res.end();
}).listen(port, () => console.log(`Server running on http://localhost:${port}`));