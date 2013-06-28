var amino;
var amino = require('./amino.js');
var apppath = "/data/briannode/";
console.log("about to launch");

var core = amino.getCore();
core.setDevice("galaxynexus");

var stage = core.createStage();
var root = core.createRect();
stage.setRoot(root);
setTimeout(function() {
        console.log("really starting now");
    core.start();
},3000);

