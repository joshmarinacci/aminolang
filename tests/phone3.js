var fs = require('fs');
var amino = require('../src/node/amino.js');
var core = amino.getCore();
core.setDevice("mac");

var stage = core.createStage();
var filedata = fs.readFileSync('tests/phone3.json');
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
}
initSettings();


function initStatusBar() {
    var time = stage.find("sbTime");
    time.setText("foo");
    setInterval(function(){
        var date = new Date();
        var txt = date.getHours() + "." + date.getMinutes() + "." + date.getSeconds()
        + "  " + date.getMonth() + "/"+date.getDay();
        console.log(txt);
        time.setText(txt);
    },1000);
}
initStatusBar();

setTimeout(function() {
    core.start();
},1000);

