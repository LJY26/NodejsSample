var http=require('http');

http.createServer(function(req,res){
	var path=req.url.replace(/\/?(?:\?.*)?$/,'').toLowerCase();
	console.log(path);
	switch(path){
		case '':
			res.writeHead(200,{'Content-Type':'text/plain'});
			res.end('HomePage');
			break;
		case '/about':
			res.writeHead(200,{'Content-Type':'text/plain'});
			res.end('AboutPage');
			break;
		default:
			res.writeHead(404, {'Content-Type':'text/plain'});
			res.end('Not Found');
			break;

	}
}).listen(3000);

console.log('Server started on localhost:3000;press Ctrl-c to terminate...');