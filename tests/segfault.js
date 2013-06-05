var amino = require('./amino.js');

var core = amino.getCore();
core.setDevice("galaxynexus");
var stage = core.createStage();
var group = core.createGroup();

var rect = core.createRect().setW(100).setH(100).setFill("#00ff00");
group.add(rect);

var button = core.createPushButton().setText("some text").setTx(200);
group.add(button);

//var image = core.createImageView().setUrl("skin.png").setTy(200);
//group.add(image);


stage.setRoot(group);

core.start();
