var add=require('../src/add.js');
var expect=require('chai').expect;

describe('加法函数的测试', function() {
	it('1加1等于2',function(){
		expect(add(1,1)).to.be.equal(2);
	});

	it('任务数加0应该等于本身',function(){
		expect(add(2,0)).to.be.equal(2);
	});

	it('0+0=0',function(){
		expect(add(0,0)).to.be.equal(0);
	});
});