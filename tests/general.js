var amino = require('../src/node/amino.js');
var core = amino.getCore();
core.setDevice("mac");
var stage = core.createStage(); 

var root = core.createGroup();
stage.setRoot(root);


function shapes(c) {
    var rect = core.createRect();
    rect.setX(100).setY(100).setW(50).setH(25).setFill("green");
    c.add(rect);
    
    stage.on("PRESS", rect, function() { 
        if(rect.getFill() == '#0000ff') {
            rect.setFill("#ff0000");
        } else {
            rect.setFill('#0000ff'); 
        }
    }); 
    
    var r2 = core.createRect();
    r2.setTx(50).setTy(200).setW(60).setH(60).setFill('#ffffff');
    c.add(r2);
    

    
    
    //e.target is a generic reference to the drag target.
    //e.deltaX is how much the x moved between events, regardless of the current
    //coordinate space's movement (ie: setting the x and y)
    //drag works even if you drag quickly and go outside the target, thus it
    //preserves the drag target through the entire gesture
    stage.on("DRAG", r2, function(e) {
        e.target.setTx(e.target.getTx() + e.delta.getX());
        e.target.setTy(e.target.getTy() + e.delta.getY());
    });
    
    
    var r3 = core.createRect();
    r3.setX(60).setY(100).setW(50).setH(50).setFill("#ffff00").setOpacity(0.5);
    c.add(r3);
}

    
    
function comps(c) {
    
    var button = core.createPushButton();
    button.setText("button").setTx(200).setTy(50).setW(150).setH(30);
    c.add(button);
    

    var tbutton = core.createToggleButton();
    tbutton.setText("toggle");
    tbutton.setTx(200).setTy(100).setW(150).setH(30);
    c.add(tbutton);
    
    var label = core.createLabel();
    label.setText("A Label");
    label.setTextColor(new amino.Color(1,1,1));
    label.setTx(200);
    label.setTy(140);
    c.add(label);
    
    var slider = core.createSlider();
    slider.setTx(200).setTy(180);
    slider.setW(150).setH(30);
    c.add(slider);
    
    
    
    
    var textbox = core.createTextField();
    textbox.setTx(200).setTy(230).setW(150).setH(30);
    textbox.setText("foo");
    c.add(textbox);
    
    
    /*
    var listview = core.createListView();
    listview.listModel = [];
    for(var i=0; i<20; i++) {
        listview.listModel.push(i+" foo");
    }
    listview.setW(200).setH(200).setTx(350).setTy(30);
    c.add(listview);
    */
}
    

function events(c) {
    
    var b1 = core.createPushButton().setText("no trans").setX(10).setY(100).setW(100).setH(30);
    c.add(b1);
    
    var b2 = core.createPushButton().setText("trans xy").setTx(120).setTy(100).setW(100).setH(30);
    c.add(b2);
    
    var b3 = core.createPushButton().setText("group trans").setTx(0).setTy(0).setW(100).setH(30);
    var g3 = core.createGroup().setTx(230).setTy(100);
    g3.add(b3);
    c.add(g3);
    
    var b4 = core.createPushButton().setText("rotate").setTx(0).setTy(0).setW(100).setH(30);
    
    var g4 = core.createTransform().setTx(10).setTy(150).setRotate(45);
    g4.setChild(b4);
    c.add(g4);
    
    
    var b5 = core.createPushButton().setText("scale").setTx(0).setTy(0).setW(100).setH(30);
    var g5 = core.createTransform().setTx(120).setTy(150).setScalex(2).setScaley(2);
    g5.setChild(b5);
    c.add(g5);
    
    
    var slider = core.createSlider().setW(100).setH(30);
    slider.setTx(100);
    slider.setTy(250);
    c.add(slider);
    
}

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

var tests = [shapes,comps,events,anims];
var current = -1;
var testgroup = core.createGroup();
root.add(testgroup);


var prevButton = core.createPushButton();
prevButton.setText("prev").setX(10).setY(10).setW(120).setH(30);
root.add(prevButton);
stage.on("PRESS",prevButton,function(e){
    testgroup.clear();
    current = current - 1;
    if(current < 0) {
        current = tests.length-1;
    }
    tests[current](testgroup);
});

var nextButton = core.createPushButton();
nextButton.setText("next").setTx(200).setY(10).setW(120).setH(30);
root.add(nextButton);
stage.on("PRESS",nextButton,function(e) {
    testgroup.clear();
    current = current + 1;
    if(current >= tests.length) {
        current = 0;
    }
    tests[current](testgroup);
});

core.start();
