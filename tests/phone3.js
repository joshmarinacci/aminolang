var fs = require('fs');
var url = require('url');
var http = require('http');
console.log(process.platform);
var apppath = "tests/";

var amino;

if(process.platform == "darwin") {
    amino = require('./amino.js');
} else {
    amino = require('./amino.js');
    apppath = "/data/phonetest/";
}
amino.startApp(function(core,stage) {

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
        core.createPropAnim(trans.src, "tx", 0, -stage.width, 250, 1, false);
        core.createPropAnim(trans.dst, "tx", stage.width,  0, 250, 1, false)
            .before(function(){ trans.dst.setVisible(true);});
        this.navstack.push(trans);
    }
    this.pop = function() {
        var trans = this.navstack.pop();
        core.createPropAnim(trans.src, "tx", -400, 0, 250, 1, false);
        core.createPropAnim(trans.dst, "tx", 0,  400, 250, 1, false)
            .after(function() { trans.dst.setVisible(false); });
    }
    var self = this;
    stage.on("WINDOWSIZE", stage, function(e) {
        for(var i in self.panels) {
            var panel = self.panels[i];
            panel.setW(e.width).setH(e.height-30);
            if(panel.getParent().type == "Transform") {
                panel.setTy(0);
            } else {
                panel.setTy(30);
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
            startX = e.x;
            startY = e.y;
        }
        var dx = e.x - startX;
        var dy = e.y - startY;
        var dt = time-startTime;
        //console.log("pressed it", " x/y ", e.x , e.y, "  dx/dy  ", dx, dy, "  dt", dt);
        clearTimeout(lastTimeout);
        lastTimeout = setTimeout(function() {
            console.log("later");
            if( startY < 75 && dy > 150 && dt < 500) {
                console.log("down swipe");
                cb({type:"down"});
            }
            if( startY > 500 && dy < -125 && dt < 300) {
                console.log("up swipe");
                cb({type:"up"});
            }
            reset();
        },100);
    });
}



var nav = new NavigationManager();






function initSettings() {
    var settings = stage.find("settings");
    var p = settings.getParent();
    p.remove(settings);
    stage.getRoot().add(settings);
    
    settings.setTx(0)
            .setTy(-settings.getH())
            .setW(stage.width);
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
                /*
                XML.parseString(str, function(err, result) {
                    var temp = result.rss.channel[0].item[0]["yweather:condition"][0].$.temp;
                    //console.log(temp);
                    cb(temp);
                });
                */
            });
    }).end();
}

function animIn(trns, soff, eoff) {
    core.createPropAnim(trns,"scalex",0.5,1.0,200,1,false);
    core.createPropAnim(trns,"scaley",0.5,1.0,200,1,false);
    core.createPropAnim(trns,"tx",stage.width/4+soff,0+eoff,200,1,false);
    core.createPropAnim(trns,"ty",stage.height/4,30,200,1,false);
}

function animOut(trns, soff, eoff) {
    var cs = trns.getScalex();
    var cx = trns.getTx();
    var cy = trns.getTy();
    core.createPropAnim(trns,"scalex",cs,0.5,200,1,false);
    core.createPropAnim(trns,"scaley",cs,0.5,200,1,false);
    core.createPropAnim(trns,"tx",cx,stage.width/4+eoff,200,1,false);
    core.createPropAnim(trns,"ty",cy,stage.height/4,200,1,false);
}

var sr;
function initApps() {
    var apps = [];
    var trans = [];
    apps.push(stage.find("todoapp"));
    apps.push(stage.find("contactsapp"));
    apps.push(stage.find("photosapp"));
    
    for(var i in apps) {
        var app = apps[i];
        app.setW(stage.width);
        app.setH(stage.height-30);
        app.setTx(0);
        app.setTy(0);
        //        app.setVisible(false);
        
        var tr = core.createGroup();
        app.setTy(0);
        var p = app.getParent();
        p.remove(app);
        tr.add(app);
        tr.setTy(30);
        p.add(tr);
        trans.push(tr);
    }
    
    
    var current = 0;
    function update() {
        apps.forEach(function(a) {
            a.setVisible(false);
        });
        apps[current].setVisible(true);
    }
    update();
    
    var settingsOpen = false;
    var navOut = false;
    var shim = core.createRect();
    shim.setTx(0).setTy(0).setW(stage.width).setH(stage.height);
    //disable drawing. we just want it for capturing events
    shim.draw = function(){}
    root.add(shim);
    shim.setVisible(false);
    function backIn() {
        navOut = false;
        shim.setVisible(false);
        for(var i=0; i<apps.length; i++) {
            apps[i].setVisible(true);
            animIn(trans[i],(i-current)*stage.width*2/3,(i-current)*stage.width);
        }
    }
    
    function backOut() {
        navOut = true;
        shim.setVisible(true);
        for(var i=0; i<apps.length; i++) {
            apps[i].setVisible(true);
            animOut(trans[i],(i-current)*stage.width,(i-current)*stage.width * 2/3);
        }
    }        
    
    sr = new SwipeRecognizer(stage,function(s){
        if(s.type == "down") {
            var settings = stage.find("settings");
            if(settingsOpen) {
                settingsOpen = false;
                var anim = core.createPropAnim(settings,"ty",0,-settings.getH(),200, 1, false);
            } else {
                settingsOpen = true;
                var anim = core.createPropAnim(settings,"ty",-settings.getH(),0,200, 1, false);
            }
        }
        if(s.type == "up") {
            if(navOut) {
                backIn();
            } else {
                backOut();
            }
        }
    });
    
    var shimmoved = 0;
    stage.on("DRAG", shim, function(e) {
        for(var i=0; i<apps.length; i++) {
            trans[i].setTx(trans[i].getTx()+e.delta.x);
        }
        shimmoved += e.delta.x;
    });
    stage.on("RELEASE", shim, function(e) {
        if(shimmoved < -50) {
            current++;
            if(current > apps.length-1) current = apps.length-1;
            backOut();
            shimmoved = 0;
            return;
        }
        if(shimmoved > 50) {
            current--;
            if(current < 0) current = 0;
            backOut();
            shimmoved = 0;
            return;
        }
        shimmoved = 0;
        backIn();
    });
}
initApps();

function initContactsList() {
    var selectedIndex = 0;
    var firstNames = ["Bob","Jason","Sally","Alice","Mick"];
    var lastNames = ["Smith","Jones","Stewart","Erickson","McMacky"];
    var contacts = [];
    for(var i=0; i<40; i++) {
        var first = firstNames[Math.floor(Math.random()*firstNames.length)]; 
        var last =  lastNames[Math.floor(Math.random()*lastNames.length)]; 
        var person = {
            first: i + "  " + first,
            last: last,
            email: first.toLowerCase()+"@"+last.toLowerCase()+".org"
        };
        contacts.push(person);
    }
    
    var list = stage.find("contactsmainlist");
    list.listModel = contacts;
    list.cellHeight = 50;
    list.cellRenderer = function(gfx, item, bounds) {
        gfx.fillQuadColor(new amino.Color(1,1,1),bounds);
        gfx.strokeRect("#000000",bounds);
        gfx.fillQuadText( new amino.Color(0,0,0),item.first + " " + item.last, bounds.x+10, bounds.y, list.getFontSize(), list.font.fontid);
    };
    
    var panel = stage.find("contactsapp");
    var details = stage.find("contactsDetails");
    
    nav.register(panel);
    nav.register(details);
    details.setVisible(false);
    nav.createTransition("showContactsDetails",panel,details,"easeIn");
    
    stage.on("SELECT",list,function(e) {
        selectedIndex = e.index;
        nav.push("showContactsDetails");
        var contact = list.listModel[selectedIndex];
        stage.find("contactsName").setText(contact.first + " " + contact.last);
        stage.find("contactsEmail").setText(contact.email);
    });
    
    stage.on("PRESS",stage.find("contactsDetailsCloseButton"),function() {
        nav.pop();
    });
    
}
initContactsList();

var skinid = 0;

function initTodoList() {
    var selectedIndex = 0;
    var verbs = ["go to","buy","sell","create","throwaway"];
    var nouns = ["apple","cart","lawn","Buddy","ball"];
    var todos = [];
    for(var i=0; i<40; i++) {
        var v = verbs[Math.floor(Math.random()*verbs.length)];
        var n = nouns[Math.floor(Math.random()*nouns.length)];
        todos.push({ title: i + " " + v + " " + n });
    }
    var panel = stage.find("todoapp");
    var details = stage.find("tododetails");
    var list = stage.find("todomainlist");
    list.listModel = todos;
    list.cellHeight = 50;
    
    function fill9slice(gfx, id, sb, insets, db) {
        var sxs = [sb.x, sb.x+insets.left, sb.x+sb.w-insets.right,  sb.x+sb.w];
        var dxs = [db.x, db.x+insets.left, db.x+db.w-insets.right,  db.x+db.w];
        var sys = [sb.y, sb.y+insets.top,  sb.y+sb.h-insets.bottom, sb.y+sb.h];
        var dys = [db.y, db.y+insets.top,  db.y+db.h-insets.bottom, db.y+db.h];
        for(var j=0; j<3; j++) {
            for(var i=0; i<3; i++) {
                gfx.fillQuadTextureSlice(id, 
                    sxs[i], sys[j], sxs[i+1]-sxs[i], sys[j+1]-sys[j],
                    dxs[i], dys[j], dxs[i+1]-dxs[i], dys[j+1]-dys[j] 
                );
            }
        }
    }
    
    list.cellRenderer = function(gfx, item,bounds) {
        var color = new amino.Color(1,1,1);
        if(item == todos[selectedIndex]) {
            color = new amino.Color(0.5,0.5,1);
        }
        //gfx.fillQuadColor(color,bounds);
        if(skinid > 0) {
            var sb = {x:27,y:33,w:201,h:53};
            var insets = { left: 10, right: 10, top: 10, bottom: 10 };
            fill9slice(gfx,skinid, sb, insets, bounds);
        }
        gfx.strokeRect("#000000",bounds);
        gfx.fillQuadText( new amino.Color(0,0,0),item.title, bounds.x+10, bounds.y, list.getFontSize(), list.font.fontid);
    };
    stage.on("SELECT",list,function(e) {
        console.log("selected todo item" + e.index);
        selectedIndex = e.index;
        nav.push("showTodoDetails");
        var title = stage.find("todoDetailsTitle");
        title.setText(list.listModel[selectedIndex].title);
    });
    
    nav.register(panel);
    nav.register(details);
    details.setVisible(false);
    nav.createTransition("showTodoDetails",panel,details,"easeIn");
    stage.on("PRESS",stage.find("todoDetailsCloseButton"),function() {
            nav.pop();
    });
}
initTodoList();

var photos = [
    { path: apppath+"/photos/photo1.jpg" },
    { path: apppath+"/photos/photo2.jpg" },
    { path: apppath+"/photos/photo3.jpg" },
    { path: apppath+"/photos/photo1.jpg" },
    { path: apppath+"/photos/photo2.jpg" },
    { path: apppath+"/photos/photo3.jpg" },
    { path: apppath+"/photos/photo1.jpg" },
    { path: apppath+"/photos/photo2.jpg" },
    { path: apppath+"/photos/photo3.jpg" }
];

function initPhotos() {
    var selectedIndex = 0;
    var list = stage.find("photosList");
    var panel = stage.find("photosapp");
    var details = stage.find("photosDetails");
    nav.register(panel);
    nav.register(details);
    details.setVisible(false);
    nav.createTransition("showPhotoDetails",panel,details,"easeIn");
    stage.on("SELECT",list,function(e) {
        console.log("selected photo item" + e.index);
        selectedIndex = e.index;
        nav.push("showPhotoDetails");
            var title = stage.find("todoDetailsTitle");
            title.setText(list.listModel[selectedIndex].title);
    });
    stage.on("PRESS",stage.find("photoDetailsBackButton"),function() {
        nav.pop();
    });
    
    //renderer for the photos
    list.listModel = photos;
    list.cellRenderer = function(gfx, item, bounds) {
        gfx.fillQuadColor(new amino.Color(1,0,0.8),bounds);
        gfx.strokeRect("#000000",bounds);
        if(item.texid) {
            gfx.fillQuadTexture(item.texid, bounds.x, bounds.y, 150, 150);
        }
    };
}
//initPhotos();

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
    var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    var time = stage.find("sbTime");
    time.setText("00.00.00 00/00");
    time.setFontSize(25);
    setInterval(function(){
        var date = new Date();
        var txt = date.getHours() + "." + date.getMinutes() + " " + date.getSeconds()
        + "    " + months[date.getMonth()] + " "+date.getDay() + " " + date.getFullYear();
        //console.log(txt);
        time.setText(txt);
    },1000);
    stage.find("statusBar").setW(stage.width);
}
initStatusBar();


});

