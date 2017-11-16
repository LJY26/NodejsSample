var express=require('express');
var path = require('path');
var fortune=require('./lib/fortune.js');
var app=express();

var handlebars=require('express3-handlebars').create({defaultLayout:'main'});
app.engine('handlebars',handlebars.engine);
app.set('view engine','handlebars');

app.set('port',process.env.PORT||3000);
app.use(express.static(__dirname+'/public'));

//var fortunes=["ceshi1","ceshi2","ceshi3","ceshi4","ceshi5"];

app.get('/',function(req,res){
	//res.type('text/plain');
	//res.send('Meadowlark Travel');
	res.render('home');
});
app.get('/about',function (req,res) {
	//res.type('text/plain');
	//res.send('About Meadowlark Travel');

	//var randomFortune=fortunes[Math.floor(Math.random()*fortunes.length)];
	//res.render('about',{'fortune':randomFortune});
	res.render('about',{'fortune':fortune.getFortune()});
})

//定制404		
app.use(function(req,res){
	//res.type('text/plain');
	res.status(404);
	//res.send('404--not found');
	res.render('404');
});

//定制500
app.use(function(err,req,res,next){
	console.log(err.stack);
	//res.type('text/plain');
	res.status(500);
	//res.send('500 Server error');
	res.render('500');
});

app.listen(app.get('port'),function(){
	console.log('Express started on http://localhost:'+app.get('port')+';press ctrl-c terminate.');
});