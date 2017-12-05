var events=require('events');

var emitter=new events.EventEmitter();

emitter.on('someEvent',function(arg1,arg2){
	console.log('listener1',arg1,arg2);
});

emitter.on('someEvent',function(arg1){
	console.log('listener2',arg1);
});

emitter.emit('someEvent','ljy',1990);