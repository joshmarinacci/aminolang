var https = require('https');
var fs = require('fs');
var amino = require('../src/node/amino.js');
var weather = require("./forecastio.js").getAPI("9141895e44f34f36f8211b87336c6a11");
var core = amino.getCore();
core.setDevice("mac");

var stage = core.createStage();


var filedata = fs.readFileSync('tests/desktop2.json');
var jsonfile = JSON.parse(filedata);
var root = new amino.SceneParser().parse(core,jsonfile);
stage.setRoot(root);
stage.setSize(1000,520);



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

setupClock();
setupWeather();

setTimeout(function() {
    core.start();
},1000);

