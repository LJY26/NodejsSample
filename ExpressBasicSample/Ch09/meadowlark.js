var express=require('express');
var path = require('path');
var fortune=require('./lib/fortune.js');
var app=express();
var formidable=require("formidable");
var jpupload=require("jquery-file-upload-middleware");
var credentials=require('./credentials.js');

var handlebars=require('express3-handlebars').create({
	defaultLayout:'main',
	helpers:{
		section:function(name,options){
			if(!this._sections)this._sections={};
			this._sections[name]=options.fn(this);
			return null;
		}
	}});
app.engine('handlebars',handlebars.engine);
app.set('view engine','handlebars');

app.set('port',process.env.PORT||3000);
app.use(express.static(__dirname+'/public'));
app.use(require('body-parser')());
app.use(require('cookie-parser')(credentials.cookieSecret));
app.use(require('express-session')({
	resave:false,
	saveUninitialized:false,
	secret:credentials.cookieSecret,
}));

app.use(function(req,res,next){
	res.locals.flash=req.session.flash;
	delete req.session.flash;
	next();
});

app.use(function(req,res,next){
	res.locals.showTests=app.get('env')!=='production'&&req.query.test==='1';
	next();		
});

//var fortunes=["ceshi1","ceshi2","ceshi3","ceshi4","ceshi5"];
function getWeatherData(){
    return {
        locations: [
            {
                name: 'Portland',
                forecastUrl: 'http://www.wunderground.com/US/OR/Portland.html',
                iconUrl: 'http://icons-ak.wxug.com/i/c/k/cloudy.gif',
                weather: 'Overcast',
                temp: '54.1 F (12.3 C)',
            },
            {
                name: 'Bend',
                forecastUrl: 'http://www.wunderground.com/US/OR/Bend.html',
                iconUrl: 'http://icons-ak.wxug.com/i/c/k/partlycloudy.gif',
                weather: 'Partly Cloudy',
                temp: '55.0 F (12.8 C)',
            },
            {
                name: 'Manzanita',
                forecastUrl: 'http://www.wunderground.com/US/OR/Manzanita.html',
                iconUrl: 'http://icons-ak.wxug.com/i/c/k/rain.gif',
                weather: 'Light Rain',
                temp: '55.0 F (12.8 C)',
            },
        ],
    };
}

app.use(function(req,res,next){
	if(!res.locals.partials){
		res.locals.partials={};
	}
	res.locals.partials.weatherContext=getWeatherData();
	next();
});


app.use("/upload",function(req,res,next){
	var now=Date.now();
	jpupload.fileHandler({
		uploadDir:function(){
			return __dirname+"/public/uploads/"+now;
		},
		uploadUrl:function(){
			return "/uploads/"+now;
		},
	})(req,res,next);
});

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
	res.render('about',{fortune:fortune.getFortune(),pageTestScript:'/qa/tests-about.js'});
});

app.get('/tours/hood-river',function(req,res){
	res.render('tours/hood-river');
});

app.get('/tours/request-group-rate',function(req,res){
	res.render('tours/request-group-rate');
});

app.get('/jquery-test',function(req,res){
	res.render("jquery-test");
});

app.get('/nursery-rhyme',function(req,res){
	res.render('nursery-rhyme');
});

app.get('/data/nursery-rhyme',function(req,res){
	res.json({
		animal:'squirrel',
		bodyPart:'tail',
		adjective:'bushy',
		noun:'heck',
	})
});

app.get("/thank-you",function(req,res){
	res.render("thank-you");
});

app.get("/newsletter",function(req,res){
	res.render('newsletter',{csrf:"CSRF token goes here"});
});

function NewsletterSignup(){}
NewsletterSignup.prototype.save=function(cb){cb();};
var VALID_EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

app.post("/newsletter",function(req,res){
	var name=req.body.name||'',email=req.body.email||'';
	if(!email.match(VALID_EMAIL_REGEX)){
		if(req.xhr){
			return res.json({error:'Invalid name eamil address.'})
		}
		req.session.flash={
			type:'danger',
			intro:'Validation error!',
			message:'The email address you entered was not valid',
		};
		return res.redirect(303,'/newsletter/archive');
	}
	new NewsletterSignup({name:name,email:email}).save(function(err){
		if(err){
			if(req.xhr){
				return res.json({err:'Database error.'});
			}
			req.session.flash={
				type:'danger',
				intro:'Database error!',
				message:'There was a database error;please try again later.',
			};
			return res.redirect(303,'/newsletter/archive');
		}
		if(req.xhr){
			return res.json({success:true});
		}
		req.session.flash={
			type:'success',
			intro:'Thank you!',
			message:'You have now been signed up for the newsletter',
		};
		return res.redirect(303,'/newsletter/archive');
	});
});

app.get('/newsletter/archive',function(req,res){
	res.render('newsletter/archive');
});

app.post("/process",function(req,res){
	if(req.xhr||req.accepts("json,html")==="json"){
		res.send({success:true});
	}else{
		res.redirect(303,"/thank-you");
	}
});

app.get("/contest/vacation-photo",function(req,res){
	var now=new Date();
	res.render("contest/vacation-photo",{year:now.getFullYear(),month:now.getMonth()});
});
app.get("/contest/vacation-photo-jfup",function(req,res){
	var now=new Date();
	res.render("contest/vacation-photo-jfup",{year:now.getFullYear(),month:now.getMonth()});
});
app.post("/contest/vacation-photo/:year/:month",function(req,res){
	var form=new formidable.IncomingForm();
	form.parse(req,function(err,fields,files){
		if(err)return res.redirect(303,"/error");
		console.log('received fields:');
		console.log(fields);
		console.log('received files:');
		console.log(files);
		res.redirect(303, '/thank-you');
	});
});

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