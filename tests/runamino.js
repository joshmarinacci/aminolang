var fs = require('fs');
//var amino = require('/data/node/amino');
var amino = require('/data/node/amino.js');
console.log("Greetings Earthling!");
var core = amino.getCore();
//console.log("core = ",core);
var stage = core.createStage();
//console.log("stage = ", stage);

var group = core.createGroup();


var rect = core.createRect();
rect.setTx(100).setTy(100).setW(100).setH(100);
rect.setFill(new amino.Color(0.5,0.5,1.0));
group.add(rect);

var r2 = core.createRect();
r2.setTx(50).setTy(50).setW(50).setH(50);
group.add(r2);


stage.on("PRESS",r2, function() {
    console.log("clicked on the little rect");
});


stage.on("DRAG",rect, function(e) {
    e.target.setTx(e.target.getTx()+e.delta.getX());
    e.target.setTy(e.target.getTy()+e.delta.getY());
});



//some components

function comps(c) {
    
    var button = core.createPushButton();
    button.setText("button");
    button.setW(200);
    button.setTx(0);
    button.setTy(0);
    c.add(button);
    

    var tbutton = core.createToggleButton();
    tbutton.setText("toggle");
    tbutton.setTx(250);
    tbutton.setTy(300);
    c.add(tbutton);
  
    /*
    var label = core.createLabel();
    label.setText("label");
    label.setX(200);
    label.setY(130);
    c.add(label);
    */
    
    var slider = core.createSlider();
    slider.setTx(500);
    slider.setTy(300);
    slider.setW(200);
    slider.setH(70);
    c.add(slider);
    
    
    /*
    var textbox = core.createTextbox();
    textbox.setX(200);
    textbox.setY(190);
    textbox.setW(100);
    textbox.setH(20);
    textbox.setText("foo");
    c.add(textbox);
    */
}

var g2 = core.createGroup();    
comps(g2);
group.add(g2);
stage.setRoot(group);

setTimeout(function() {
    console.log("starting later\n");
    core.start();
},3000);
