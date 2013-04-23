var fs = require('fs');
var amino = require('../src/node/amino.js');
var core = amino.getCore();
core.setDevice("mac");

var stage = core.createStage();


var root = core.createGroup();
stage.setRoot(root);

var grid = core.createListView();
grid.listModel = [];
grid.setW(300).setH(300);
grid.DEBUG = true;
grid.cellHeight = 100;
grid.cellWidth = 100;
grid.layout = "horizwrap";

for(var i=0; i<20; i++) {
    grid.listModel.push(i+"foo"); 
}

root.add(grid);


setTimeout(function(){
    core.start();
},1000);
