// copied snippet, please forgive CommonJS cruft...

const http = require('http');
const server = http.createServer();

server.on('request', (request, response) => {
    let body = [];
    request.on('data', (chunk) => {
        body.push(chunk);
    }).on('end', () => {
    body = Buffer.concat(body).toString();

	console.log(`==== ${request.method} ${request.url}`);
	console.log('> Headers');
        console.log(request.headers);

	console.log('> Body');
	console.log(body);
        response.end();
    });

    response.writeHead(200, {'Content-Type': 'text/plain', 'Access-Control-Allow-Origin':  'http://127.0.0.1:3000', 'Cache-Control': 'max-age=604800'});
    response.end('OK\n');
}).listen(8080);

