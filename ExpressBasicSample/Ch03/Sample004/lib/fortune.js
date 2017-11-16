var fortunes=["1ceshi1","2ceshi2","3ceshi3","4ceshi4","5ceshi5"];

exports.getFortune=function(){
	var idx=Math.floor(Math.random()*fortunes.length);
	return fortunes[idx];
}