var https = require('https');
var fs = require('fs');
var amino = require('../build/desktop/amino.js');
var weather = require("./forecastio.js").getAPI("9141895e44f34f36f8211b87336c6a11");
var NAV = require('./desktop/navmanager.js');
var UTILS = require("./Utils.js");
var core = amino.getCore();
var URL = require('url');
var http = require('http');
var googleapis = require('googleapis');
var OAuth2Client = googleapis.OAuth2Client;
core.setDevice("mac");

var stage = core.createStage();

var nav = new NAV.NavigationManager(stage);

var filedata = fs.readFileSync('tests/desktop2.json');
var jsonfile = JSON.parse(filedata);
var root = new amino.SceneParser().parse(core,jsonfile);
stage.setRoot(root);
stage.setSize(300+500+300,520);



function setupClock() {
    var text = stage.find("clockLabel");
    text.setText("12:00");
    setInterval(function() {
        var timestamp = new Date();
        text.setText(""+timestamp);
    },1000);
}

function setupWeather() {
    var text = stage.find("weatherLabel");
    text.setText("getting weather");
    var latitude = 44.051944;
    var longitude = -123.086667;
    weather.getAt(latitude,longitude, function(json) {
        text.setText(json.currently.temperature+" degrees");
    });
}
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
    var currentAlbum = lib.albums[0];
    var currentTrack = 0;
    
    var title = stage.find("musicTitle");
    function prevTrack() {
        currentTrack--;
        if(currentTrack < 0) currentTrack = 0;
        title.setText(currentAlbum.tracks[currentTrack].title);
    }
    stage.on("ACTION",stage.find("prevButton"),prevTrack);
    function nextTrack() {
        currentTrack++;
        if(currentTrack > currentAlbum.tracks.length-1) {
            currentTrack = 0;
        }
        title.setText(currentAlbum.tracks[currentTrack].title);
    }
    stage.on("ACTION",stage.find("nextButton"),nextTrack);
    
    
    var artwork = stage.find("musicArtwork");
    artwork.sw = 75;
    artwork.sh = 75;
    function setAlbum(album) {
        currentAlbum = album;
        currentTrack = 0;
        var url = currentAlbum.artwork;
        console.log(url);
        artwork.setUrl(url);
        title.setText(currentAlbum.tracks[currentTrack].title);
    }
    setAlbum(lib.albums[0]);
    
    var popup = stage.find("musicPopup");
    var widget = stage.find("musicWidget");
    nav.createTransition("showMusicPopup",widget,popup,"popup");
    
    var albumList = stage.find("albumList");
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
    stage.on("ACTION",stage.find("musicOpenButton"), function() {
            nav.push("showMusicPopup");
    });
    stage.on("ACTION",stage.find("musicCloseButton"), function() {
            nav.pop();
    });
}

function setupEditor() {
    var editor = stage.find("mainEditText");
    editor.setText("foo");
    var txt = "empty";
    if(fs.existsSync("foo.txt")) {
        txt = fs.readFileSync("foo.txt");
    }
    editor.setText(txt.toString());
    function saveEditor() {
        console.log("saving: " + editor.getText());
        fs.writeFileSync("foo.txt",editor.getText());
    }
    setInterval(saveEditor,5000);
}

function setupTodos() {
    var todos = stage.find("todoList");
    var items = [
        {
            id:"foo1",
            data:{
                text:"foo1"
            }
        },
    ];
    todos.listModel = items;
    todos.cellRenderer = function(gfx,info,bounds) {
        var color = amino.ParseRGBString("#ccffff");
        if(info.list.selectedIndex == info.index) {
            color = new amino.Color(0.1,0.7,1.0);
        }
        gfx.fillQuadColor(color, bounds);
        gfx.fillQuadText(new amino.Color(0,0,0),
            info.item.data.text,
            bounds.x+5, bounds.y, info.list.getFontSize(), info.list.font.fontid);
    }
    todos.setFontSize(15);
    /*
    UTILS.getJSON("http://joshy.org:3001/bag/search",function(err,data){
        if(err) return;
        todos.listModel = data;
    });
    */
}

var settings = {};
var CLIENT_ID = "767399125691.apps.googleusercontent.com";
var CLIENT_SECRET = "PYphM5OVQI7HE9PYwZfFRI6l";
var REDIRECT_URL = "urn:ietf:wg:oauth:2.0:oob";
function setupCalendar() {
    
    nav.createTransition("showCalendarSetupPopup",stage.find("calendarWidget"),stage.find("gcalSetup"),"popup");
    console.log("exits = " + fs.existsSync("settings.json"));
    if(fs.existsSync("settings.json")) {
        console.log("it exists. loading it");
        settings = JSON.parse(fs.readFileSync("settings.json").toString());
    }
    stage.on("ACTION",stage.find("calendarSetupButton"), function() {
        nav.push("showCalendarSetupPopup");
    });
    
    stage.on("ACTION",stage.find("openBrowserButton"), setupGcal);
    stage.on("ACTION",stage.find("verifyButton"), finishGcalAuth);
    if(settings.credentials) {
        console.log('skipping auth. already have credentials');
        googleapis.discover('calendar','v3')
        .execute(function(err,client) {
                console.log("directly getting the calendar list");
            oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
            oauth2Client.credentials = settings.credentials;
            getCalendarList(client,oauth2Client);
        });
    }
}

function getCalendarList(client, authClient) {
    client
        .calendar.calendarList.list({})
        .withAuthClient(authClient)
        .execute(function(err,list) {
            console.log(err,list);
        });
}

var oauth2Client = null;
var gclient = null;

function finishGcalAuth() {
    var code =  stage.find("codeField").getText();
    console.log("pasted code = ",code);
    oauth2Client.getToken(code, function(err, tokens) {
        oauth2Client.credentials = tokens;
        settings.credentials = tokens;
        console.log("got the token finally: " + tokens);
        console.log("now settings = ",settings);
        fs.writeFileSync("settings.json",JSON.stringify(settings));
        getCalendarList(gclient,oauth2Client);
        nav.pop();
    });
}
function getAccessToken(oauth2Client) {
  var url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: 'https://www.googleapis.com/auth/calendar.readonly'
  });
  console.log('Visit the url: ', url);
  UTILS.openBrowser(url);
}

function setupGcal() {
    console.log("settings = ",settings);
    googleapis
        .discover('calendar','v3')
        .execute(function(err,client) {
          console.log("now we can make oauth connections for calendar info");
          oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
            if(settings.credentials) {
                oauth2Client.credentials = settings.credentials;
                getCalendarList(client,oauth2Client);
            } else {
                gclient = client;
                getAccessToken(oauth2Client);
            }
        });
}

setupClock();
setupWeather();
setupMusic();
setupEditor();
setupTodos();
setupCalendar();
/*
function setupTodoView() {
    var options = URL.parse("http://joshy.org:3001/bag/search");
    var req = http.request(options, function(res) {
        var content = "";
        res.on("data", function(d) { content += d; });
        res.on("end", function(d) {
                var json = JSON.parse(content);
                console.log("got it",json);
        });
    });
    req.end();
}
setupTodoView();
*/


//make the main view be resized when the window does
nav.register(stage.find("main"));

setTimeout(function() {
    core.start();
},1000);

