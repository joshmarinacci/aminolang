var amino = require('../build/desktop/amino.js');
var widgets = require('../build/desktop/widgets.js');
var fs = require('fs');

amino.startApp(function(core, stage) {
        stage.setSize(320,480);
    var root = new amino.ProtoGroup().setTx(0);
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
        /*
        core.createPropAnim(trans.src, "tx", 0, -stage.width, 250, 1, false);
        trans.dst.setVisible(true);
        core.createPropAnim(trans.dst, "tx", stage.width,  0, 250, 1, false);
//            .before(function(){ trans.dst.setVisible(true);});
        this.navstack.push(trans);
        */
        trans.src.setVisible(false);
        trans.dst.setVisible(true);
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
            /*
            if(panel.getParent().type == "Transform") {
                panel.setTy(0);
            } else {
            */
                panel.setTy(30);
            //}
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

function buildStatusBar(stage)  {
    var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    var time = new amino.ProtoText();
    time.setText("00.00:00 00/00");
    time.setFontSize(12);
    setInterval(function(){
        var date = new Date();
        var txt = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds()
        + "    " + months[date.getMonth()] + "/"+date.getDay() + "/" + date.getFullYear();
        //console.log(txt);
        time.setText(txt);
    },1000);
    
    var bg = new amino.ProtoRect();
    bg.setW(320).setH(20);
    var g = new amino.ProtoGroup();
    g.add(bg);
    g.add(time);
    g.setTx(0).setTy(0)
    return g;    
}

root.add(buildStatusBar(stage));

function buildApp1(stage) {
    var panel = new widgets.AnchorPanel();
    panel.add(new widgets.Label()
        .setText("Todo List").setFontSize(20));
    panel.setTx(0).setTy(20).setW(320).setH(480-20);
    //list view
    panel.add(new widgets.PushButton()
            .setText("Add")
            .setW(100).setH(30)
            .setTy(390).setTx(6)
            );
    return panel;
};
root.add(buildApp1(stage));    

function buildApp2(stage) {
    var panel = new widgets.AnchorPanel();
    panel.setTx(0).setTy(20).setW(320).setH(480-20);
    panel.add(new widgets.PushButton()
            .setText("snap photo")
            .setW(160).setH(60).setTx(0).setTy(370));
    panel.add(new widgets.PushButton()
            .setText("gallery")
            .setW(160).setH(60).setTx(160).setTy(370));
    return panel;            
}

root.add(buildApp2(stage));

function buildApp3(stage) {
    var panel = new widgets.AnchorPanel();
    panel.setTx(0).setTy(20).setW(320).setH(480-20);
    panel.add(new widgets.PushButton()
            .setText("reply")
            .setW(90).setH(40).setTx(94).setTy(390));
    panel.add(new widgets.PushButton()
            .setText("delete")
            .setW(90).setH(40).setTx(190).setTy(390));
    panel.add(new widgets.PushButton()
            .setText("compose")
            .setW(90).setH(40).setTx(0).setTy(390));
    //list view
    panel.add(new widgets.Label()
            .setText("Email").setW(297).setFontSize(20)
            .setTy(4).setTx(4).setH(32));
    return panel;            
}

root.add(buildApp3(stage));

function buildApp4(stage) {
    var panel = new widgets.AnchorPanel();
    panel.setTx(0).setTy(20).setW(320).setH(400);
    panel.add(new widgets.PushButton()
        .setText("Prev")
        .setW(100).setH(30).setTx(0).setTy(400));
    panel.add(new widgets.PushButton()
        .setText("Play")
        .setW(100).setH(30).setTx(105).setTy(400));
    panel.add(new widgets.PushButton()
        .setText("Next")
        .setW(100).setH(30).setTx(211).setTy(400));
    return panel;
}
root.add(buildApp4(stage));

function buildApp5(stage) {
    var panel = new widgets.AnchorPanel();
    panel.setTx(0).setTy(20).setW(320).setH(430);
    panel.add(new widgets.Label()
        .setText("707-707-7077").setFontSize(30)
        .setW(200).setH(50).setTx(65).setTy(15)
        );
    panel.add(new widgets.PushButton()
        .setText("1")
        .setW(60).setH(50).setTx(25).setTy(78));
    return panel;
}
root.add(buildApp5(stage));

function buildApp6(stage) {
    var panel = new widgets.AnchorPanel();
    panel.setTx(0).setTy(20).setW(320).setH(430);
    panel.add(new widgets.Label()
        .setText("Today: 3/3/33").setFontSize(18)
        .setW(319).setH(40)
        .setTop(0).setLeft(10).setRight(10)
        );
    //list view
    var addEventButton = new widgets.PushButton()
        .setText("add event")
        .setId("addEvent")
        .setW(100).setH(29).setTx(5).setTy(390);
    panel.add(addEventButton);
    panel.add(new widgets.PushButton()
        .setText("add alarm")
        .setW(100).setH(30).setTx(110).setTy(390)
        .setBottom(10).setAnchorBottom(true).setAnchorTop(false)
        );
    panel.add(new widgets.PushButton()
        .setText("add timer")
        .setW(100).setH(30).setTx(215).setTy(390));
    
    var addEventPanel = new widgets.AnchorPanel();
    addEventPanel.add(new widgets.Label()
        .setText("add a new event").setFontSize(18)
        .setW(319).setH(40).setTx(0).setTy(0)
        );
    addEventPanel.setVisible(true);
    
    
    nav.register(panel);
    nav.register(addEventPanel);
    nav.createTransition("addEvent",panel,addEventPanel,"easeIn");
    core.on("action",addEventButton,function() {
        nav.push("addEvent");
    });
    
    var g = new amino.ProtoGroup();
    g.add(panel);
    g.add(addEventPanel);
    return g;
}
root.add(buildApp6(stage));
});
