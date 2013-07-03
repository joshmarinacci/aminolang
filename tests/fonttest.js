var amino = require('../build/desktop/amino.js');
var core = amino.getCore();
core.setDevice("mac");
var stage = core.createStage();

var button = core.createPushButton().setText("ABC");
stage.setRoot(button);
core.start();

