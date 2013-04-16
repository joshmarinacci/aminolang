var fs = require('fs');
//var amino = require('/data/node/amino');
var amino = require('/data/node/amino.js');
console.log("Greetings Earthling!");
var core = amino.getCore();
var stage = core.createStage();



var filedata = fs.readFileSync('scene.json');
var jsonfile = JSON.parse(filedata);
console.log(jsonfile);
var root = new amino.SceneParser().parse(core,jsonfile);
stage.setRoot(root);


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


stage.on("PRESS",stage.findNodeById("prevButton"), function() {
    console.log("clicked on the prev button");
});
stage.on("PRESS",stage.findNodeById("nextButton"), function() {
    console.log("clicked on the next button");
});

apps[0].setVisible(true);



/*
var rect = core.createRect();
rect.setW(100).setH(100).setX(0).setY(0).setTx(0).setTy(0);
var group = core.createGroup();
group.add(rect);
group.setTx(300);
stage.setRoot(group);
*/

setTimeout(function() {
    console.log("starting later\n");
    core.start();
},1000);
