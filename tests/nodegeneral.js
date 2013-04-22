var fs = require('fs');
var amino = require('/data/node/amino.js');
var core = amino.getCore();
//set up the screen properly
core.setDevice("galaxynexus");

var root = core.createGroup();
stage.setRoot(root);


var listview = core.createListView();
listview.listModel = [];
for(var i=0; i<20; i++) {
    listview.listModel.push(i+" foo");
}
listview.setW(200).setH(200).setTx(350).setTy(30);
root.add(listview);

setTimeout(function(){
    core.start();
},1000);
