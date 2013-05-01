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
}

function SwipeRecognizer(stage,cb) {
    
    var MAX_SWIPE_DURATION = 500;
    var MIN_SWIPE_DISTANCE = 50;
    
    var started;
    var startTime;
    var startX;
    var startY;
    function reset() {
        started = false;
        startTime = 0;
        startX = 0;
        startY = 0;
    }
    reset();
    
    var lastTimeout = 0;
    stage.on("DRAG",null,function(e) {
        var time = Date.now();
        if(!started) {
            started = true;
            startTime = time;
            startX = e.point.x;
            startY = e.point.y;
        }
        var dx = e.point.x - startX;
        var dy = e.point.y - startY;
        var dt = time-startTime;
        //console.log("pressed it", " x/y ", e.point.x , e.point.y, "  dx/dy  ", dx, dy, "  dt", dt);
        clearTimeout(lastTimeout);
        lastTimeout = setTimeout(function() {
            console.log("later");
            if(
                startY < 150 &&
                dy > 300 &&
                dt < 500) {
                console.log("down swipe");
                cb({type:"down"});
           }
            reset();
        },100);
    });
}



var nav = new NavigationManager();






function initSettings() {
    var settingsButton = stage.find("settingsButton");
    var settings = stage.find("settings");
    var p = settings.getParent();
    p.remove(settings);
    p.add(settings);
    
    settings.setTx(0)
            .setTy(-settings.getH())
            .setW(stage.width);
    
    /*
    stage.on("PRESS",settingsButton, function(e) {
        stage.addAnim(amino.anim(settings,"ty",-settings.getH(),0,300));
    });
    stage.on("PRESS",settings,function(e) {
        stage.addAnim(amino.anim(settings,"ty",0,-settings.getH(),300));
    });*/
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


var sr;
function initApps() {
    var apps = [];
    apps.push(stage.find("todoapp"));
    apps.push(stage.find("contactsapp"));
    for(var i in apps) {
        var app = apps[i];
        app.setW(stage.width);
        app.setH(stage.height-70);
        app.setTx(0);
        app.setTy(70);
        app.setVisible(false);
    }
    
    var current = 0;
    function update() {
        apps.forEach(function(a) {
            a.setVisible(false);
        });
        apps[current].setVisible(true);
    }
    update();
    /*
    stage.on("PRESS",stage.find("nextButton"), function(e) {
        current++;
        update();
    });
    stage.on("PRESS",stage.find("prevButton"), function(e) {
        current--;
        update();
    });
    */
    
    var settingsOpen = false;
    sr = new SwipeRecognizer(stage,function(s){
        if(s.type == "down") {
            var settings = stage.find("settings");
            if(settingsOpen) {
                settingsOpen = false;
                stage.addAnim(amino.anim(settings,"ty",0,-settings.getH(),200));
            } else {
                settingsOpen = true;
                stage.addAnim(amino.anim(settings,"ty",-settings.getH(),0,200));
            }
        }
            /*
        console.log("got swipe: ",s);
        if(s.type == "down") {
            stage.addAnim(amino.anim(settings,"ty",-settings.getH(),0,300));
        }
        if(s.type == "left") {
            current++;
            if(current > apps.length-1) current = apps.length-1;
            update();
        }
        if(s.type == "right") {
            current--;
            if(current < 0) current = 0;
            update();
        }
        */
    });
}
initApps();

function initContactsList() {
    var firstNames = ["Bob","Jason","Sally","Alice","Mick"];
    var lastNames = ["Smith","Jones","Stewart","Erickson","McMacky"];
    var contacts = [];
    for(var i=0; i<40; i++) {
        var first = firstNames[Math.floor(Math.random()*firstNames.length)]; 
        var last =  lastNames[Math.floor(Math.random()*lastNames.length)]; 
        var person = {
            first: first,
            last: last,
            email: first.toLowerCase()+"@"+last.toLowerCase()+".org"
        };
        console.log(person);
        contacts.push(person);
    }
    
    var list = stage.find("contactsmainlist");
    list.listModel = contacts;
    list.cellHeight = 50;
    list.cellRenderer = function(gfx, item, bounds) {
        gfx.fillQuadColor(new amino.Color(1,1,1),bounds);
        gfx.fillQuadText( new amino.Color(0,0,0),item.first + " " + item.last, bounds.x+10, bounds.y);
    };
}
initContactsList();

function initTodoList() {
    var verbs = ["go to","buy","sell","create","throwaway"];
    var nouns = ["apple","cart","lawn","Buddy","ball"];
    var todos = [];
    for(var i=0; i<40; i++) {
        var v = verbs[Math.floor(Math.random()*verbs.length)];
        var n = nouns[Math.floor(Math.random()*nouns.length)];
        todos.push({ title: v + " " + n });
    }
    var list = stage.find("todomainlist");
    list.listModel = todos;
    list.cellHeight = 50;
    list.cellRenderer = function(gfx, item,bounds) {
        gfx.fillQuadColor(new amino.Color(1,1,1),bounds);
        gfx.fillQuadText( new amino.Color(0,0,0),item.title, bounds.x+10, bounds.y);
    };
        
}
initTodoList();

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

