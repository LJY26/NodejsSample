var fs=require('fs');

fs.readFile("./context.txt", function(err,data) {
	if(err){
		console.log(err);
	}else{
		console.log(data);
	}
});

fs.readFile("./context.txt", "utf-8", function(err,data) {
	if(err){
		console.log(err);
	}else{
		console.log(data);
	}
});

fs.readFile("./context1.txt", "utf-8", function(err,data) {
	if(err){
		console.log(err);
	}else{
		console.log(data);
	}
});