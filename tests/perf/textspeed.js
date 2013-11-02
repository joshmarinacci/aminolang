var amino = null;
var widgets = null;
/*
if(process.platform == 'darwin') {
    amino = require('../../build/desktop/amino.js');
    widgets = require('../../build/desktop/widgets.js');
} else {
    amino = require('./amino.js');    
    widgets = require('./widgets.js');
}
*/
var amino = require('../../build/desktop/amino.js');
var widgets = require('../../build/desktop/widgets.js');

function rand(min, max) {
    return Math.random()*(max-min) + min;
}

amino.startTest(function(core,root) {
	for(var i=0; i<100; i++) {
		root.add(new amino.ProtoText()
			.setTx(rand(0,500))
			.setTy(rand(0,500))
			.setText("shorttext")
			);
	}
	var results = core.runTest({
		count: 5*60,
		sync: true,
		events: false,
		anim: false,
	});
	console.log(results);
	console.log("avg frame len = " + results.totalTime/results.count);
});
