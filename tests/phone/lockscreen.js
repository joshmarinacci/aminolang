var amino = require('amino.js');
var moment = require('moment');
var widgets = require('widgets.js');


function LockScreen(core,stage) {
    var g = new widgets.AnchorPanel().setFill("#5577ff")
    .setW(320)
    .setH(480);
    console.log("getting state height: " + stage.getH());
    stage.on("WINDOWSIZE", stage, function(e) {
        //g.setW(e.width/2).setH(e.height/2);
    });
    
    
    //load the image, scale to fit, center it.
    var path = "photo1.jpg";
    if(process.platform == 'darwin') {
        path = "tests/orange.jpg";
    }
    var img = new amino.ProtoImageView().setSrc(path);
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

    console.log(moment().format('MMMM Do YYYY, h:mm:ss a'));
    var timeLabel = new widgets.Label()
        .setFill("#ffffff")
        .setFontSize(20)
        .setText("12:38")
        .setTx(20)
        .setAnchorTop(true).setTop(10);
    g.add(timeLabel);
    var dateLabel = new amino.ProtoText()
        .setFill("#ffffff")
        .setFontSize(15)
        .setText("Tuesday Jan 18th")
        .setTx(20).setTy(50)
        ;
    g.add(dateLabel);
    
    setInterval(function() {
        timeLabel.setText(moment().format('h:mm'));
        dateLabel.setText(moment().format('dddd MMM Do'));
    },1000);
    
    //time
    //date
    //weather
    //battery
    
    var icon_bolt = '\uF0E7';
    var cloud = '\uF0C2';
    var envelope = '\uF0E0';
    var battery = new widgets.Label()
        .setFontName('awesome')
        .setFill("#ffffff")
        .setText(icon_bolt)
        .setFontSize(20)
        .setAnchorRight(true).setRight(20);
        g.add(battery);
    var batterylevel = new widgets.Label()
        .setFill("#ffffff")
        .setText('88%')
        .setFontSize(20)
        .setAnchorRight(true).setRight(5);
    g.add(batterylevel);
    
    var weather = new widgets.AnchorPanel()
        .setW(300).setH(40)
        .setAnchorLeft(true).setLeft(10)
        .setAnchorRight(true).setRight(10)
        .setAnchorTop(true).setTop(200)
        .setFill("#ffffff")
        ;
    
    
    var col2 = 40;
    var col1 = 5;
    g.add(weather);
    var weatherIcon = new widgets.Label()
        .setFontName('awesome')
        .setFill("#ffffff")
        .setTx(col1).setText(cloud)
        ;
    weather.add(weatherIcon);
    var weatherLabel = new widgets.Label()
        .setText("68\u00F8, cloudy")
        .setFill("#000000").setFontSize(15)
        .setTx(col2);
    weather.add(weatherLabel);
    weather.comps.background.setOpacity(0.6);
    
    
    
    var email = new widgets.AnchorPanel();
    email.setW(300).setH(40)
        .setAnchorLeft(true).setLeft(10)
        .setAnchorRight(true).setRight(10)
        .setAnchorTop(true).setTop(250)
        .setFill("#ffffff");
    email.add(new widgets.Label()
        .setFill("#ffffff")
        .setFontName('awesome')
        .setText(envelope).setTx(col1)); 
    email.add(new widgets.Label().setTx(col2).setFontSize(12)
        .setText("Hi Sweetie. Please make sure you pick up some.."));
    email.comps.background.setOpacity(0.6);
    g.add(email);
    
    
    var unlock = new widgets.PushButton().setText("unlock")
        .setFill("#ffffff")
        .setLeft(10).setAnchorLeft(true)
        .setRight(10).setAnchorRight(true)
        .setBottom(10).setAnchorBottom(true)
        .setW(200).setH(40).onAction(function() {
            var anim = core.createPropAnim(g,'rotateY',0,-90,300)
                .after(function() {
                        g.setVisible(false);
                });
    });
    unlock.comps.background.setOpacity(0.6);
    unlock.comps.label.setFill("#ffffff");
    g.add(unlock);
    return g;
}
exports.LockScreen = LockScreen;
