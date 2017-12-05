var http=require('http');
var querystring=require('querystring');

var contents=querystring.stringify({name:1});

var options={
	host:'www.baidu.com',
	path:'',
	method:'POST',
	headers:{
		'Content-Type':'application/x-www-form-urlencoded',
		'Content-Length':contents.length
	}
};

var req=http.request(options,function(res){
	res.setEncoding('utf-8');
	res.on('data',function(data){
		console.log(data);
	});
});

req.write(contents);
req.end();
