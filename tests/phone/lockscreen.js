var amino = null;
var widgets = null;
var moment = null;
if(process.platform == 'darwin') {
    amino = require('../../build/desktop/amino.js');
    widgets = require('../../build/desktop/widgets.js');
    moment = require('moment');
} else {
    amino = require('./amino.js');    
    widgets = require('./widgets.js');
    moment = require('./moment.js');
}


function LockScreen(core,stage) {
    var g = new widgets.AnchorPanel().setFill("#5577ff").setW(stage.getW()/2);
    console.log("getting state height: " + stage.getH());
    stage.on("WINDOWSIZE", stage, function(e) {
        g.setW(e.width/2).setH(e.height/2);
    });
    
    
    //load the image, scale to fit, center it.
    var img = new amino.ProtoImageView().setSrc("tests/photos/photo1.jpg");
    var ww = 320;
    var wh = 480;
    var sc = ww/img.getW();
    var sc2 = wh/img.getH();
    sc = Math.max(sc,sc2);
    img.setScalex(sc).setScaley(sc);
    var xoff = 320-sc*img.getW();
    img.setTx(xoff/2);
    var yoff = 480-sc*img.getH();
    img.setTy(yoff/2);
    g.add(img);
    console.log("width = ", 320*2);

    console.log(moment().format('MMMM Do YYYY, h:mm:ss a'));
    var timeLabel = new widgets.Label()
        .setText("12:38")
        .setTx(10)
        .setFill("#ffffff")
        .setFontSize(80)
        .setAnchorTop(true).setTop(20);
    g.add(timeLabel);
    var dateLabel = new amino.ProtoText().setText("Tuesday Jan 18th").setTx(20).setTy(100).setFill("#ffffff").setFontSize(20);
    g.add(dateLabel);
    
    var weatherLabel = new widgets.Label()
        .setText("80deg, sunny")
        .setTx(20)
        .setFill("#ffffff")
        .setFontSize(25)
        .setAnchorTop(true).setTop(160);
    g.add(weatherLabel);
    
    setInterval(function() {
        timeLabel.setText(moment().format('h:mm'));
        dateLabel.setText(moment().format('dddd MMM Do'));
    },1000);
    
    //time
    //date
    //weather
    //battery
    
    
    g.add(new widgets.PushButton().setText("unlock")
        .setLeft(10).setAnchorLeft(true)
        .setRight(10).setAnchorRight(true)
        .setBottom(10).setAnchorBottom(true)
        .setW(200).setH(40).onAction(function() {
                g.setVisible(false);
    }));
    return g;
}
exports.LockScreen = LockScreen;
