var http=require('http');

var request=http.get({host:'www.baidu.com'});
request.on('response',function(res){
	res.setEncoding('utf-8');
	res.on('data',function(data){
		console.log(data);
	})
});