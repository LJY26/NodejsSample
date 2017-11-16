var express=require('express');
var http=require('http');
var path = require('path');
var fs=require('fs');
var fortune=require('./lib/fortune.js');
var app=express();
var formidable=require("formidable");
var jpupload=require("jquery-file-upload-middleware");
var credentials=require('./credentials.js');
//var emailService=require('./lib/email.js')(credentials);
var Vacation=require('./models/vacation.js');

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

app.use(function(req,res,next){
	//var cluster=require('cluster');
	//if(cluster.isWorker){
	//	console.log('Worker %d received request',cluster.worker.id);
	//}
	//next();

	var domain=require('domain').create();
	domain.on('error',function(err){
		console.error('DOMAIN ERROR CAUGHT\n',err.stack);
		try{
			setTimeout(function() {
				console.error('Failsafe shutdown');
				process.exit(1);
			}, 5000);

			var worker=require('cluster').worker;
			if(worker)worker.disconnect();
			server.close();

			try{
				next(err);
			}catch(error){
				// if Express error route failed, try
				// plain Node response
				console.error('Express error mechanism failed.\n', error.stack);
				res.statusCode = 500;
				res.setHeader('content-type', 'text/plain');
				res.end('Server error.');
			}
		}catch(error){
			console.error('Unable to send 500 response.\n', error.stack);
		}
	});
	domain.add(req);
	domain.add(res);
	domain.run(next);
});
app.use(express.static(__dirname+'/public'));
app.use(require('body-parser')());
app.use(require('cookie-parser')(credentials.cookieSecret));
app.use(require('express-session')({
	resave:false,
	saveUninitialized:false,
	secret:credentials.cookieSecret,
}));

var mongoose=require('mongoose');
var options={
	server:{
		socketOptions:{keepAlive:1}
	}
};
switch(app.get('env')){
	case 'development':
		mongoose.connect(credentials.mongo.development.connectionString,options);
		break;
	case 'production':
		mongoose.connect(credentials.mongo.production.connectionString,options);
		break;
	default:
		throw new Error('Unknown execution environment:'+app.get('env'));
}

Vacation.find(function(err,vacations){
	if(vacations.length)return;
	new Vacation({
		name:'Hood River Day Trip',
		slug: 'hood-river-day-trip',
		category: 'Day Trip',
		sku: 'HR199',
		description: 'Spend a day sailing on the Columbia and ' + 
		'enjoying craft beers in Hood River!',
		priceInCents: 9995,
		tags: ['day trip', 'hood river', 'sailing', 'windsurfing', 'breweries'],
		inSeason: true,
		maximumGuests: 16,
		available: true,
		packagesSold: 0,
	}).save();

	new Vacation({
		name: 'Oregon Coast Getaway',
		slug: 'oregon-coast-getaway',
		category: 'Weekend Getaway',
		sku: 'OC39',
		description: 'Enjoy the ocean air and quaint coastal towns!',
		priceInCents: 269995,
		tags: ['weekend getaway', 'oregon coast', 'beachcombing'],
		inSeason: false,
		maximumGuests: 8,
		available: true,
		packagesSold: 0,
	}).save();

	new Vacation({
		name: 'Rock Climbing in Bend',
		slug: 'rock-climbing-in-bend',
		category: 'Adventure',
		sku: 'B99',
		description: 'Experience the thrill of rock climbing in the high desert.',
		priceInCents: 289995,
		tags: ['weekend getaway', 'bend', 'high desert', 'rock climbing', 'hiking', 'skiing'],
		inSeason: true,
		requiresWaiver: true,
		maximumGuests: 4,
		available: false,
		packagesSold: 0,
		notes: 'The tour guide is currently recovering from a skiing accident.',
	}).save();
});

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

var dataDir=__dirname+'/data';
var vacationPhotoDir=dataDir+'/vacation-photo';
if(!fs.existsSync(dataDir)){
	fs.mkdirSync(dataDir);
}
if(!fs.existsSync(vacationPhotoDir)){
	fs.mkdirSync(vacationPhotoDir);
}

function saveContestEntry(contestName,email,year,month,photoPath){

}

app.post("/contest/vacation-photo/:year/:month",function(req,res){
	var form=new formidable.IncomingForm();
	form.parse(req,function(err,fields,files){
		if(err){
			return res.redirect(303,"/error");
		}		
		if(err){
			res.session.flash={
				type:'danger',
				intro:'0ops！',
				message:'There was an error processing your submission . '+'Pelase try again.',
			};
			return res.redirect(303,'/contest/vacation-photo');
		}

		var photo=files.photo;
		var dir=vacationPhotoDir+'/'+Date.now();
		var path=dir+'/'+photo.name;
		fs.mkdirSync(dir);
		fs.renameSync(photo.path, dir+'/'+photo.name);
		saveContestEntry('vacation-photo',fields.email,req.params.year,req.params.month,path);
		req.session.flash={
			type:'success',
			intro:'Good Luck!',
			message:'You have been entered into the contest.',
		};
		return res.redirect(303,'/contest/vacation-photo/entries');
	});
});

app.get('/fail',function(req,res){
	throw new Error('Nope!');
});

app.get('/epic-fail',function(req,res){
	process.nextTick(function() {
		throw new Error('Kaboom!');
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

var server;
function startServer(){
	server=http.createServer(app).listen(app.get('port'),function(){
		console.log( 'Express started in ' + app.get('env') +
				' mode on http://localhost:' + app.get('port') +
				'; press Ctrl-C to terminate.' );
	})
}

if (require.main===module) {
	startServer();
}else{
	module.exports=startServer;
}

//app.listen(app.get('port'),function(){
//	console.log('Express started on http://localhost:'+app.get('port')+';press ctrl-c terminate.');
//});