var expect=require('chai').expect;

describe('timeout.test.js--超时测试', function() {
	it('测试应该5000毫秒结束',function(done){
		var x=true;
		var f=function(){
			x=false;
			expect(x).to.be.not.ok;
			done();
		};
		setTimeout(f,4000);
	});
});