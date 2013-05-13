var https = require('https');
var amino = require('../src/node/amino.js');


var weather = require("./forecastio.js").getAPI("9141895e44f34f36f8211b87336c6a11");
var core = amino.getCore();
core.setDevice("mac");

var stage = core.createStage();
var root = core.createGroup();
stage.setRoot(root);
stage.setSize(1000,520);


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
                    name:"Yellow Submarine",
                    artist: "The Beatles",
                    artwork: "tests/images/beatles_03.jpg",
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
                },
                {
                    name:"Abbey Road",
                    artist: "The Beatles",
                    artwork: "tests/images/beatles_01.jpg",
                    tracks: [
                        {
                            title:"Come Together"
                        },
                        {
                            title: "Something"
                        },
                        {
                            title: "Maxwell's Silver Hammer",
                        }
                    ]
                },
                {
                    name:"For Sale",
                    artist: "The Beatles",
                    artwork: "tests/images/beatles_02.jpg",
                    tracks: [
                        {
                            title:"No Reply"
                        },
                        {
                            title: "I'm A Loser"
                        },
                        {
                            title: "Baby's In Black",
                        }
                    ]
                },
                {
                    name:"Hopes and Fears",
                    artist: "Keane",
                    artwork: "tests/images/keane_01.jpg",
                    tracks: [
                        {
                            title:"Somewhere Only We Know"
                        },
                        {
                            title: "This Is The Last Time"
                        },
                        {
                            title: "Bend & Break",
                        }
                    ]
                },
                {
                    name:"Perfect Symmetry",
                    artist: "Keane",
                    artwork: "tests/images/keane_02.jpg",
                    tracks: [
                        {
                            title:"Spiralling"
                        },
                        {
                            title: "The Lovers Are Losing"
                        },
                        {
                            title: "Better Than This",
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
        title.setTy(0).setTx(70);
        title.setFontSize(16);
        widget.add(title);
        
        function setAlbum(album) {
            currentAlbum = album;
            currentTrack = 0;
            var url = currentAlbum.artwork;
            console.log(url);
            artwork.setUrl(url);
            title.setText(currentAlbum.tracks[currentTrack].title);
        }
        
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
        play.setText("play")
            .setW(80).setH(28).setTx(100).setTy(70);
        widget.add(play);
        
        var prev = core.createPushButton().setText("prev");
        prev.setW(80).setH(28).setTy(70).setTx(0);
        widget.add(prev);
        stage.on("PRESS",prev,prevTrack);

        var next = core.createPushButton().setText("next");
        next.setW(80).setH(28).setTy(70).setTx(230);
        widget.add(next);
        stage.on("PRESS",next,nextTrack);

        
        var artwork = core.createImageView();
        artwork.setUrl("tests/images/beatles_01.jpg");
        artwork.sw = 75;
        artwork.sh = 75;
        widget.add(artwork);
        
        
        var self = this;
        var bg = core.createAnchorPanel();
        bg.setW(500).setH(450).setTx(320).setTy(10).setFill("#00ff00");
        var albumList = core.createListView();
        albumList.setTx(0).setTy(0).setW(500).setH(400);
        albumList.listModel = lib.albums;
        albumList.cellRenderer = function(gfx, info, bounds) {
            var color = amino.ParseRGBString("#ccffff");//amino.Color(0.5,0.5,0.5);
            if(info.list.selectedIndex == info.index) {
                color = new amino.Color(0.1,0.7,1.0);
            }
            gfx.fillQuadColor(color, bounds);
            
            gfx.fillQuadText(new amino.Color(0,0,0),
                info.item.name,
                bounds.x+5, bounds.y, info.list.getFontSize(), info.list.font.fontid);
        };
        stage.on("SELECT",albumList, function(e) {
            var n = e.index;
            console.log("selected index: " + n);
            setAlbum(lib.albums[n]);
        });
        
        var closeButton = core.createPushButton().setText("done");
        closeButton.setTx(400).setTy(420).setW(100).setH(28);
        bg.add(closeButton);
        bg.add(albumList);
        
        
        var first = true;
        function showPopup() {
            console.log("popup pressed");
            var root = stage.getRoot();
            if(!first) {
                root.remove(bg);
                first = false;
            }
            root.add(bg);
            bg.setVisible(true);
        }
        function hidePopup() {
            bg.setVisible(false);
        }
        var popupButton = core.createPushButton().setText("more...");
        popupButton.setTx(230).setTy(5).setW(80).setH(28);
        widget.add(popupButton);        
        stage.on("ACTION",popupButton,showPopup);
        stage.on("ACTION",closeButton,hidePopup);
        
        return widget;
    }
    widgets.add(setupMusic().setTy(200));

    return widgets;
}

root.add(setupWidgets());


function setupMain() {
    var main = core.createAnchorPanel();
    var bg = core.createRect();
    bg.setW(600).setH(500).setFill("#ffffff");
    main.add(bg);
    main.setW(600).setH(500);
    
    
    var commandline = core.createTextField();
    commandline.setW(600).setH(30).setTy(500-30).setTx(0).setText('foo');
    main.add(commandline);
    
    stage.on("ACTION",commandline,function(e) {
        console.log("action happened");
        commandline.setText("");
    });
    
    
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

