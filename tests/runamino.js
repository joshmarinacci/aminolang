var fs = require('fs');
//var amino = require('/data/node/amino');
var amino = require('/data/node/amino.js');
console.log("Greetings Earthling!");
var core = amino.getCore();
//console.log("core = ",core);

var stage = core.createStage();


var filedata = fs.readFileSync('scene.json');
var jsonfile = JSON.parse(filedata);
console.log(jsonfile);
var root = new amino.SceneParser().parse(jsonfile);
stage.setRoot(root);
console.log(root);


var apps = [
    stage.findNodeById("app1"),
    stage.findNodeById("app2"),
    stage.findNodeById("app3")
];

for(var i in apps) {
    apps[i].setTx(0);
    apps[i].setTy(50);
    apps[i].setVisible(false);
}

apps[0].setVisible(true);


//console.log("app1 = ", apps[0]);
//stage.findNode("app1").setVisible(false);
console.log("app1 = ", stage.findNodeById("app1").id)
//stage.findNodeById("app1").setVisible(false);
//stage.findNodeById("app2").setVisible(false);
//stage.findNodeById("app3").setVisible(false);


//console.log("stage = ", stage);

/*
var group = core.createGroup();

var r1 = core.createRect();
r1.setTx(100).setW(200).setH(200).setFill("#00ff00");
group.add(r1);
stage.setRoot(group);

var b1 = core.createPushButton();
b1.setText("foo bar");
b1.setTx(300).setTy(300);
group.add(b1);
*/


/*
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
  
    
    var label = core.createLabel();
    label.setText("label");
    label.setX(200);
    label.setY(130);
    c.add(label);
    
    
    var slider = core.createSlider();
    slider.setTx(500);
    slider.setTy(300);
    slider.setW(200);
    slider.setH(70);
    c.add(slider);
    
    
    
    var textbox = core.createTextbox();
    textbox.setX(200);
    textbox.setY(190);
    textbox.setW(100);
    textbox.setH(20);
    textbox.setText("foo");
    c.add(textbox);
    
}

var g2 = core.createGroup();    
comps(g2);
group.add(g2);
stage.setRoot(group);
*/

setTimeout(function() {
    console.log("starting later\n");
    core.start();
},3000);
