var fs = require('fs');
var amino = require('/data/node/amino.js');
var core = amino.getCore();
//set up the screen properly
core.setDevice("galaxynexus");

var root = core.createRect();
root.setW(300).setH(300);
stage.setRoot(root);

var miny = -100;
var going = true;
stage.onGlobal("DRAG", function(e) {
    if(!going) return;
    if(e.y < miny) {
        console.log("swipe failed");
        going = false;
    } else {
        console.log("continuing swipe");
        miny = e.y;
        //if we swiped for 200 pixels
        if(miny > 200) {
            stage.fireGlobal("SWIPE_VERTICAL");
        }
    }
});

setTimeout(function(){
    core.start();
},1000);

