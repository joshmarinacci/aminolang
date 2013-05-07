var https = require('https');
var amino = require('../src/node/amino.js');

var weather = require("./forecastio.js").getAPI("9141895e44f34f36f8211b87336c6a11");
var core = amino.getCore();
core.setDevice("mac");

var stage = core.createStage();
var root = core.createGroup();
stage.setRoot(root);

//stage.setSize(1200,800);
//manual anchor?


function setupWidgets() {
    var widgets = core.createGroup();
    
    function setupClock() {
        var widget = core.createGroup();
        var bg = core.createRect();
        bg.setW(300).setH(100).setFill("#ff0000");
        widget.add(bg);
        var text = core.createLabel();
        text.setText("12:00").setTextColor(new amino.Color(0,0,0)).setFontSize(30);
        widget.add(text);
        
        setInterval(function() {
            var timestamp = new Date();
            text.setText(""+timestamp);
        },1000);
        return widget;
    }
    widgets.add(setupClock());
    
    
    function setupWeather() {
        var widget = core.createGroup();
        var bg = core.createRect();
        bg.setW(300).setH(100).setFill("#8800ff");
        widget.add(bg);
        var text = core.createLabel();
        text.setText("abc").setFontSize(30);
        widget.add(text);
        //var api_key = "9141895e44f34f36f8211b87336c6a11";
        //37.8267,-122.423
        
        var latitude = 37.8267;
        var longitude = -122.423;
        weather.getAt(latitude,longitude, function(json) {
            text.setText(json.currently.temperature+" degrees");
        });
        
        return widget;
    }
    widgets.add(setupWeather().setTy(100));

    
    var music   = core.createRect();
    music.setW(300).setH(100).setFill("#0088ff").setTy(200);
    widgets.add(music);

    return widgets;
}

root.add(setupWidgets());


function setupMain() {
    var main = core.createGroup();
    var panel = core.createRect();
    panel.setW(800).setH(800).setFill("#ffffff");
    main.add(panel);
    main.setTx(300).setTy(0);
    return main;
}
root.add(setupMain());


function postInit() {
    console.log("in post init");
}

setTimeout(function() {
    core.start();
    postInit();
},1000);

