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
        console.log("registered");
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
        stage.addAnim(amino.anim(trans.dst, "tx", stage.width,  0, 250));
        this.navstack.push(trans);
    }
    this.pop = function() {
        var trans = this.navstack.pop();
        stage.addAnim(amino.anim(trans.src, "tx", -400, 0, 250));
        stage.addAnim(amino.anim(trans.dst, "tx", 0,  400, 250));
    }
    var self = this;
    stage.on("WINDOWSIZE", stage, function(e) {
        console.log('window changed. resizing panels to ' + e.width + " " + e.height);
        for(var i in self.panels) {
            var panel = self.panels[i];
            panel.setW(e.width).setH(e.height-50);
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



//init the dock
var dock = stage.find("dock");
dock.setTx(stage.height).setW(stage.width);
stage.on("PRESS",stage.find("upButton"),function(e) {
    for(var i=0; i<apps.length; i++) {
        animOut(apps[i],(i-curr)*stage.width,(i-curr)*stage.width * 2/3);
    }
    
    dock.setTx(0);
    stage.addAnim(a(dock,"ty",stage.height,stage.height-60,200));
    console.log(dock.getTy());
    
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
    });
    
});


stage.find("composePanel").setVisible(false);
stage.find("contactsPanel").setVisible(false);



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


stage.on("PRESS",stage.find("rightButton"),function(e) {
    if(curr == apps.length-1) return;
    for(var i=0; i<apps.length; i++) {
        stage.addAnim(a(apps[i],"tx", 
            (i-curr)*stage.width/3+stage.width/4, 
            (i-curr-1)*stage.width/3+stage.width/4,
            300).setEase(amino.cubicInOut));
    }
    curr++;
    if(curr > apps.length-1) curr = apps.length-1;
});
stage.on("PRESS",stage.find("leftButton"),function(e) {
    if(curr == 0) return;
    for(var i=0; i<apps.length; i++) {
        stage.addAnim(a(apps[i],"tx", 
            (i-curr)*stage.width/3+stage.width/4, 
            (i-curr+1)*stage.width/3+stage.width/4, 
            300).setEase(amino.cubicInOut));
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

