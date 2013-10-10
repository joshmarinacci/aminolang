var amino = null;
var widgets = null;
if(process.platform == 'darwin') {
    amino = require('../../build/desktop/amino.js');
    widgets = require('../../build/desktop/widgets.js');
} else {
    amino = require('./amino.js');    
    widgets = require('./widgets.js');
}

amino.startTest(function(core,root) {
    for(var i=0; i<100; i++) {
        root.add(new amino.ProtoRect()
			.setTx(0)
			.setTy(i*50)
			.setW(400)
			.setH(50)
             );
        }
	for(var i=0; i<100; i++) {
		root.add(new amino.ProtoText()
			.setTx(0)
			.setTy(i*50)
			.setText("shorttext")
			);
	}
    var results = core.runTest({
            count: 1000,
            sync: false,
            events: false,
            anim: false,
    });
    console.log("sequential",results);
	console.log("avg frame len = " + results.totalTime/results.count);
});
/*
amino.startTest(function(core,root) {
    for(var i=0; i<100; i++) {
        root.add(new amino.ProtoRect()
			.setTx(0)
			.setTy(i*50)
			.setW(400)
			.setH(50)
             );
		root.add(new amino.ProtoText()
			.setTx(0)
			.setTy(i*50)
			.setText("shorttext")
			);
	}
    var results = core.runTest({
            count: 1000,
            sync: false,
            events: false,
            anim: false,
    });
    console.log("alternating",results);
	console.log("avg frame len = " + results.totalTime/results.count);
});
*/






