var amino = require('../build/desktop/amino.js');
var general = require('./generalutil.js');
var core = amino.getCore();
core.setDevice("mac");
var stage = core.createStage(); 

var root = core.createGroup();
stage.setRoot(root);

function anims(c) {
    var rect = core.createRect();    
    rect.setX(30);
    rect.setY(100);
    rect.setW(20);
    rect.setH(20);
    rect.setFill("#ff0000");
    c.add(rect);
    /*
    var anim = chain(
        together(
            a(rect,"x",0,100,1000),
            a(rect,"y",0,100,1000)
        ),
        chain(
            a(rect,"x",100, 200,1000).setEase(elasticOut),
            a(rect,"y",100,  50,500).setEase(cubicInOut),
            a(rect,"x",200, 100,500).setEase(cubicInOut)
        ),
        together(
            a(rect,"x",100,0,500).setEase(cubicInOut),
            a(rect,"y",50, 0,500).setEase(cubicInOut)
        )
        ).after(function() {
            console.log("all done!");
        });
    stage.addAnim(anim);
    */
}

var tests = [general.shapes, general.comps, general.events,anims];
var current = -1;
var testgroup = core.createGroup();
root.add(testgroup);


var prevButton = core.createPushButton();
prevButton.setText("prev").setX(10).setY(10);
root.add(prevButton);
stage.on("PRESS",prevButton,function(e){
    testgroup.clear();
    current = current - 1;
    if(current < 0) {
        current = tests.length-1;
    }
    tests[current](testgroup,core,stage);
});

var nextButton = core.createPushButton();
nextButton.setText("next").setTx(180).setY(10);
root.add(nextButton);
stage.on("PRESS",nextButton,function(e) {
    testgroup.clear();
    current = current + 1;
    if(current >= tests.length) {
        current = 0;
    }
    tests[current](testgroup,core,stage);
});

core.start();
