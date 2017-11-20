var expect=chai.expect;

describe('浏览器加法函数测试', function() {
	it('1+1=2',function(){
		expect(add(1,1)).to.be.equal(2);
	});
});