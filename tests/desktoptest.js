var https = require('https');
var amino = require('../src/node/amino.js');


var weather = require("./forecastio.js").getAPI("9141895e44f34f36f8211b87336c6a11");
var core = amino.getCore();
core.setDevice("mac");

var stage = core.createStage();
var root = core.createGroup();
stage.setRoot(root);
stage.setSize(1000,700);


function setupWidgets() {
    var widgets = core.createGroup();
    
    function setupClock() {
        var widget = core.createGroup();
        var bg = core.createRect();
        bg.setW(300).setH(100).setFill("#ff2299");
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
        bg.setW(300).setH(100).setFill("#cc00ff");
        widget.add(bg);
        var text = core.createLabel();
        text.setText("abc").setFontSize(30);
        widget.add(text);
        //var api_key = "9141895e44f34f36f8211b87336c6a11";
        //37.8267,-122.423
        
        var latitude = 44.051944;
        var longitude = -123.086667;
        weather.getAt(latitude,longitude, function(json) {
            text.setText(json.currently.temperature+" degrees");
        });
        
        return widget;
    }
    widgets.add(setupWeather().setTy(100));

    
    function setupMusic() {
        var lib = {
            albums: [
                {
                    artist: "The Beatles",
                    name:"Yellow Submarine",
                    tracks: [
                        {
                            title: "Yellow Submarine",
                        },
                        {
                            title: "Hey Bulldog",
                        },
                        {
                            title: "Eleanor Rigby",
                        },
                        {
                            title: "Nowhere Man",
                        }
                    ]
                }
            ]
        }
        
        
        var widget = core.createGroup();
        var bg = core.createRect();
        bg.setW(300).setH(100).setFill("#0088ff");
        widget.add(bg);
        
        var currentAlbum = lib.albums[0];
        var currentTrack = 0;
        

        var title = core.createLabel();
        title.setText("now playing...");
        widget.add(title);
        
        function nextTrack() {
            currentTrack++;
            if(currentTrack > currentAlbum.tracks.length-1) {
                currentTrack = 0;
            }
            title.setText(currentAlbum.tracks[currentTrack].title);
        }
        function prevTrack() {
            currentTrack--;
            if(currentTrack < 0) currentTrack = 0;
            title.setText(currentAlbum.tracks[currentTrack].title);
        }
        function togglePlay() {
        }
        
        
        var play = core.createPushButton();
        play.setText("play").setW(50).setH(28).setTx(100).setTy(40);
        widget.add(play);
        
        var prev = core.createPushButton().setText("prev");
        prev.setW(50).setH(28).setTy(40).setTx(0);
        widget.add(prev);
        stage.on("PRESS",prev,prevTrack);

        var next = core.createPushButton().setText("next");
        next.setW(50).setH(28).setTy(40).setTx(200);
        widget.add(next);
        stage.on("PRESS",next,nextTrack);

        
        return widget;
    }
    widgets.add(setupMusic().setTy(300));

    return widgets;
}

root.add(setupWidgets());


function setupMain() {
    var main = core.createGroup();
    var panel = core.createRect();
    panel.setW(800).setH(800).setFill("#ffffff");
    main.add(panel);
    
    var commandline = core.createTextField();
    commandline.setW(800).setH(30).setTy(400);
    commandline.setText('foo');
    main.add(commandline);
    
    
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

