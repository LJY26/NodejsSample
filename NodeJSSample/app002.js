var http=require('http');

http.createServer(function(req,res){
	res.writeHead(200, {'Content-Type':'text/html'});
	res.write("<h1>NodeJS</h1>");
	res.end("<p>Hello World");

}).listen(3000);

console.log("Http server is listen at port 3000...");