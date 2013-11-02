var amino = require('../../build/desktop/amino.js');
var widgets = require('../../build/desktop/widgets.js');

amino.startTest(function(core,root) {
        /*
    for(var i=0; i<100; i++) {
        root.add(new amino.ProtoRect()
			.setTx(0)
			.setTy(i*50)
			.setW(400)
			.setH(50)
             );
        }*/
	for(var i=0; i<100; i++) {
		root.add(new amino.ProtoText()
			.setTx(0)
			.setTy(i*50)
			.setText("shorttext")
			);
	}
    var results = core.runTest({
            count: 50,
            sync: true,
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






