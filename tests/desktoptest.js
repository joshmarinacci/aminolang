
var https = require('https');

var amino = require('../src/node/amino.js');

var darksky = require("darksky");
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
        bg.setW(300).setH(100).setFill(new amino.Color(0.5,1.0,0));
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
        bg.setW(300).setH(100).setFill(new amino.Color(0.5,0.0,1.0));
        widget.add(bg);
        
        var api_key = "9141895e44f34f36f8211b87336c6a11";
        //37.8267,-122.423
        var latitude = 37.8267;
        var longitude = -122.423;
        var options = {
            host: 'api.forecast.io',
            port: 443,
            path : '/forecast/'+api_key+'/'+latitude+','+longitude ,
            method : 'GET'
        };
        
        var req = https.request(options, function(res) {
            res.on('data', function(d) {
                    console.log("data");
            });
            res.on("end",function(d) {
                    console.log("end");
            });
        });
        
        req.end();
        
        return widget;
    }
    widgets.add(setupWeather().setTy(100));

    
    var music   = core.createRect();
    music.setW(300).setH(100).setFill(new amino.Color(0,0.5,1.0)).setTy(200);
    widgets.add(music);

    return widgets;
}

root.add(setupWidgets());


function setupMain() {
    var main = core.createGroup();
    var panel = core.createRect();
    panel.setW(800).setH(800).setFill(new amino.Color(1,1,1));
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

