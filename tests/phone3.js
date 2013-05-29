var amino = require('./amino.js');
var apppath = "/data/phonetest/";

var core = amino.getCore();
var stage = core.createStage();

var root = core.createRect().setW(300).setH(300);
stage.setRoot(root);

core.start();

