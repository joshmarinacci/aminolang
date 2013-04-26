var fs = require('fs');
//var amino = require('/data/node/amino.js');
var amino = require('../src/node/amino.js');
var core = amino.getCore();
//set up the screen properly
core.setDevice("mac");

var stage = core.createStage();

//load up the scene file
var filedata = fs.readFileSync('tests/phone.json');
var jsonfile = JSON.parse(filedata);
var root = new amino.SceneParser().parse(core,jsonfile);
stage.setRoot(root);

//set our util functions and data
var a = amino.anim;

function wrapTransform(target) {
    var trans = core.createTransform();
    target.setTx(0).setTy(0);
    var p = target.getParent();
    p.remove(target);
    trans.setChild(target);
    p.add(trans);
    return trans;
}
function animOut(trns, soff, eoff) {
    stage.addAnim(amino.anim(trns,"scalex",1.0,0.5,200));
    stage.addAnim(amino.anim(trns,"scaley",1.0,0.5,200));
    stage.addAnim(amino.anim(trns,"tx",soff,stage.width/4+eoff,200));
    stage.addAnim(amino.anim(trns,"ty",0+50,stage.height/4,200));
}

function animIn(trns, soff, eoff) {
    stage.addAnim(a(trns,"scalex",0.5,1.0,200));
    stage.addAnim(a(trns,"scaley",0.5,1.0,200));
    stage.addAnim(a(trns,"tx",stage.width/4+soff,0+eoff,200));
    stage.addAnim(a(trns,"ty",stage.height/4,50,200));
}


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

var nav = new NavigationManager();


//set up the apps
var apps = [];
var curr = 0;

//init the apps
apps.push(wrapTransform(stage.find("app1")));
apps.push(wrapTransform(stage.find("app2")));
apps.push(wrapTransform(stage.find("app3")));
apps.push(wrapTransform(stage.find("app4")));
apps.push(wrapTransform(stage.find("app5")));
apps.push(wrapTransform(stage.find("app6")));


//init the apps
for(var i=0; i<apps.length; i++) {
    apps[i].setTx(i*stage.width);
    apps[i].setTy(50);
    console.log(apps[i].getChild().type);
    apps[i].getChild().setW(stage.width);
    apps[i].getChild().setH(stage.height-50);
    nav.register(apps[i].getChild());
}

var zoomState = "in";

//init the dock
var dock = stage.find("dock");
dock.setTx(stage.height).setW(stage.width);
stage.on("PRESS",stage.find("upButton"),function(e) {
    zoomStage = "out";
    for(var i=0; i<apps.length; i++) {
        animOut(apps[i],(i-curr)*stage.width,(i-curr)*stage.width * 2/3);
    }
    
    dock.setTx(0);
    stage.addAnim(a(dock,"ty",stage.height,stage.height-60,200));
    
    //insert a transparent shim
    var shim = core.createRect();
    shim.setTy(40).setW(stage.width).setH(stage.height).setFill("green").setOpacity(0.2);
    //disable drawing
    shim.draw = function(){}
    root.add(shim);
    //click on the shim to animate everything back
    stage.on("PRESS", shim, function(e) {
        shim.getParent().remove(shim);
        for(var i=0; i<apps.length; i++) {
            animIn(apps[i],(i-curr)*stage.width * 2/3,(i-curr)*stage.width);
        }
        stage.addAnim(a(dock,"ty",stage.height-60,stage.height,200));
        zoomStage = "in";
    });
    
});

function setupEmail() {
    var a = stage.find("app3");
    var c = stage.find("composePanel");
    c.setVisible(false);
    nav.register(a);
    nav.register(c);
    nav.createTransition("composeEmail",a,c,"slideRight");
    
    stage.on("PRESS",stage.find("composeButton"),function(e) {
        nav.push("composeEmail");
    });
    stage.on("PRESS",stage.find("composeCancel"),function(e) {
        nav.pop();
    });
    
    stage.find("contactsPanel").setVisible(false);
}

setupEmail();

function setupDialer() {
    var a = stage.find("app5");
    var c = stage.find("contactsPanel");
    c.setVisible(false);
    nav.register(a);
    nav.register(c);
    nav.createTransition("selectContact",a,c,"slideRight");
    stage.on("PRESS",stage.find("contactsButton"), function() { nav.push("selectContact"); });
    stage.on("PRESS",stage.find("contactsClose"), function() { nav.pop(); });
}
setupDialer();

stage.on("PRESS",stage.find("addItemButton"),function(e) {
    process.exit(0);
});

var todoList = stage.find("todoList");
todoList.listModel = [];
for(var i=0; i<40; i++) {
    todoList.listModel.push(i+" foo");
}
todoList.setW(stage.width).setH(stage.height-200).setTx(0);
stage.find("addItemButton").setTy(10).setY(0);


var os = 2.0/3.0;
stage.on("PRESS",stage.find("rightButton"),function(e) {
    if(curr == apps.length-1) return;
    for(var i=0; i<apps.length; i++) {
        var sx = (i-curr)*stage.width*os+stage.width/4; 
        var ex = (i-curr-1)*stage.width*os+stage.width/4 ;
        if(zoomState == "in") {
            //sx = (i-curr)*stage.width + 0;
            //ex = (i-curr-1)*stage.width + 0;
        }
        stage.addAnim(a(apps[i],"tx", sx, ex, 300).setEase(amino.cubicInOut));
    }
    curr++;
    if(curr > apps.length-1) curr = apps.length-1;
});
stage.on("PRESS",stage.find("leftButton"),function(e) {
    if(curr == 0) return;
    for(var i=0; i<apps.length; i++) {
        var sx = (i-curr)*stage.width*os+stage.width/4;
        var ex = (i-curr+1)*stage.width*os+stage.width/4;
        if(zoomState == "in") {
            //sx = (i-curr)*stage.width + 0;
            //ex = (i-curr+1)*stage.width + 0;
        }
        stage.addAnim(a(apps[i],"tx", sx, ex, 300).setEase(amino.cubicInOut));
    }
    curr--;
    if(curr < 0) curr = 0;
});




//move the topslider to the top of it's siblings
var settings = stage.find("quicksettings");
var par = settings.getParent();
settings.getParent().remove(settings);
par.add(settings);
settings.setW(stage.width).setTx(0).setTy(-300);

stage.on("PRESS",stage.find("downButton"), function(e) {
    settings.setTx(0).setTy(0);
    stage.addAnim(a(settings,"ty",-200,0,300).setEase(amino.cubicInOut));
});
stage.on("PRESS",stage.find("quicksettings"),function(e){
    stage.addAnim(a(settings,"ty",0,-200,300));
});


console.log("stage size = " + stage.width + " " + stage.height);

//delay 1 sec to ensure the png image is loaded first
setTimeout(function() {
    core.start();
},1000);

