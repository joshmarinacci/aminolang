var fs = require('fs');
var url = require('url');
var http = require('http');
//var amino = require('../src/node/amino.js');
var amino = require('./amino.js');
var core = amino.getCore();
var XML = require('xml2js');
core.setDevice("galaxynexus");
//core.setDevice("mac");

var stage = core.createStage();
var filedata = fs.readFileSync('phone3.json');
var jsonfile = JSON.parse(filedata);
var root = new amino.SceneParser().parse(core,jsonfile);
stage.setRoot(root);



function NavigationManager() {
    this.panels = [];
    this.register = function(panel) {
        this.panels.push(panel);
    }
    this.transitions = {};
    this.createTransition = function(name,src,dst,type) {
        this.transitions[name] = {
            name:name,
            src:src,
            dst:dst,
            type:type
        };
    }
    this.navstack = [];
    this.push = function(name) {
        var trans = this.transitions[name];
        stage.addAnim(amino.anim(trans.src, "tx", 0, -stage.width, 250));
        stage.addAnim(amino.anim(trans.dst, "tx", stage.width,  0, 250)
            .before(function(){ trans.dst.setVisible(true);})
            );
        this.navstack.push(trans);
    }
    this.pop = function() {
        var trans = this.navstack.pop();
        stage.addAnim(amino.anim(trans.src, "tx", -400, 0, 250));
        stage.addAnim(amino.anim(trans.dst, "tx", 0,  400, 250)
            .after(function() { trans.dst.setVisible(false); })
            );
    }
    var self = this;
    stage.on("WINDOWSIZE", stage, function(e) {
        for(var i in self.panels) {
            var panel = self.panels[i];
            panel.setW(e.width).setH(e.height-50);
            if(panel.getParent().type == "Transform") {
                panel.setTy(0);
            } else {
                panel.setTy(50);
            }
        }
    });
    stage.on("DRAG", stage, function(e) {
        console.log("drag event " + e);
    });
}

var nav = new NavigationManager();


function initSettings() {
    var settingsButton = stage.find("settingsButton");
    var settings = stage.find("settings");
    settings.setTx(0).setTy(-settings.getH());
    stage.on("PRESS",settingsButton, function(e) {
        stage.addAnim(amino.anim(settings,"ty",-settings.getH(),0,300));
    });
    stage.on("PRESS",settings,function(e) {
        stage.addAnim(amino.anim(settings,"ty",0,-settings.getH(),300));
    });
    var weather = stage.find("weatherText");
    weather.setFontSize(20);
    weather.setText("foo rainy cloudy poo");
}
initSettings();

function getWeather(cb) {
    var options = url.parse("http://weather.yahooapis.com/forecastrss?w=2502265&u=f");
    options.method = 'get';
    console.log(options);
    http.request(options, function(res) {
//            console.log("response = ",res);
            var str = "";
            res.on("data",function(d) {
                    str = str + d;
            });
            res.on("end", function() {
                //console.log("done. data = " + str);
                XML.parseString(str, function(err, result) {
                    var temp = result.rss.channel[0].item[0]["yweather:condition"][0].$.temp;
                    //console.log(temp);
                    cb(temp);
                });
            });
    }).end();
}

/*
setInterval(function() {
        getWeather(function(w) {
            console.log(w);
            var weather = stage.find("weatherText");
            weather.setText(""+w+"o");
        });
},5000);
*/

function initStatusBar() {
    var time = stage.find("sbTime");
    time.setText("00.00.00 00/00");
    setInterval(function(){
        var date = new Date();
        var txt = date.getHours() + "." + date.getMinutes() + "." + date.getSeconds()
        + "  " + date.getMonth() + "/"+date.getDay();
        //console.log(txt);
        time.setText(txt);
    },1000);
}
initStatusBar();

setTimeout(function() {
    core.start();
},3000);

