var fs = require('fs');
//var amino = require('/data/node/amino.js');
var amino = require('../src/node/amino.js');
var core = amino.getCore();
//set up the screen properly
core.setDevice("mac");

var stage = core.createStage(); 
var root = core.createGroup();
stage.setRoot(root);


var listview = core.createListView();
listview.listModel = [];
for(var i=0; i<20; i++) {
    listview.listModel.push(i+" foo");
}
listview.setW(200).setH(200).setTx(50).setTy(30);
root.add(listview);



var filedata = fs.readFileSync('tests/anchor.json');
var jsonfile = JSON.parse(filedata);
var anchorRoot = new amino.SceneParser().parse(core,jsonfile);
anchorRoot.setTy(300);
root.add(anchorRoot);

var ap = stage.find("anchorPanel");
ap.setW(300).setH(300);

setTimeout(function(){
    core.start();
},1000);
