var amino = require('../build/desktop/amino.js');
var widgets = require('../build/desktop/widgets.js');
var fs = require('fs');

amino.startApp(function(core, stage) {
    stage.setSize(320,480);


var nav = new NavigationManager();
nav.insets.bottom = 30+20;
nav.insets.top = 0;

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
    
    var panel = new widgets.AnchorPanel();
    panel.setW(320).setH(20);
    panel.setFill("#ff0000");
    panel.add(time);
    return panel;
}


var switcherPanel = new widgets.AnchorPanel();
switcherPanel.setW(320).setH(480);
switcherPanel.setFill("#0000ff");
stage.on("WINDOWSIZE", stage, function(e) {
    switcherPanel.setW(e.width);
    switcherPanel.setH(e.height);
});
stage.setRoot(switcherPanel);


var statusBar = buildStatusBar(stage);
statusBar.setAnchorLeft(true).setAnchorRight(true);
switcherPanel.add(statusBar);

var root = new amino.ProtoGroup();
root.setTy(20);
switcherPanel.add(root);


var switcher = new Switcher();
switcher.root = root;


function buildApp1(stage) {
    var panel = new widgets.AnchorPanel();
    panel.add(new widgets.Label()
        .setText("Todo List").setFontSize(20));
    //list view
    panel.add(new widgets.PushButton()
            .setText("Add")
            .setW(100).setH(30)
            .setTy(390).setTx(6)
            );
    nav.register(panel);
    return panel;
};
switcher.add(buildApp1(stage));

function buildApp2(stage) {
    var panel = new widgets.AnchorPanel();
    panel.add(new widgets.PushButton()
            .setText("snap photo")
            .setW(160).setH(60).setTx(0).setTy(370));
    panel.add(new widgets.PushButton()
            .setText("gallery")
            .setW(160).setH(60).setTx(160).setTy(370));
    nav.register(panel);
    return panel;            
}
switcher.add(buildApp2(stage));

function buildApp3(stage) {
    var panel = new widgets.AnchorPanel();
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
    nav.register(panel);
    return panel;            
}
switcher.add(buildApp3(stage));

function buildApp4(stage) {
    var panel = new widgets.AnchorPanel();
    panel.add(new widgets.PushButton()
        .setText("Prev")
        .setW(100).setH(30).setTx(0).setTy(400));
    panel.add(new widgets.PushButton()
        .setText("Play")
        .setW(100).setH(30).setTx(105).setTy(400));
    panel.add(new widgets.PushButton()
        .setText("Next")
        .setW(100).setH(30).setTx(211).setTy(400));
    nav.register(panel);
    return panel;
}
switcher.add(buildApp4(stage));

function buildApp5(stage) {
    var panel = new widgets.AnchorPanel();
    panel.add(new widgets.Label()
        .setText("707-707-7077").setFontSize(30)
        .setW(200).setH(50).setTx(65).setTy(15)
        );
    panel.add(new widgets.PushButton()
        .setText("1")
        .setW(60).setH(50).setTx(25).setTy(78));
    nav.register(panel);
    return panel;
}
switcher.add(buildApp5(stage));


function buildApp6(stage) {
    var panel = new widgets.AnchorPanel();
    panel.setId("calendarpanel");
    panel.add(new widgets.Label()
        .setText("Today: 3/3/33").setFontSize(18)
        .setW(319).setH(40)
        .setTop(0).setLeft(10).setRight(10)
        );
    //list view
    panel.add(new widgets.PushButton()
        .setText("add event")
        .setId("addEvent")
        .setW(100).setH(29).setTx(5)
        .setBottom(10).setAnchorBottom(true)
        .onAction(function() {  nav.push("addEvent");   })
        );
    panel.add(new widgets.PushButton()
        .setText("add alarm")
        .setW(100).setH(30).setTx(110)
        .setBottom(10).setAnchorBottom(true)
        );
    panel.add(new widgets.PushButton()
        .setText("add timer")
        .setW(100).setH(30).setTx(215)
        .setBottom(10).setAnchorBottom(true)
        );
    
    var addEventPanel = new widgets.AnchorPanel();
    addEventPanel.setFill("#ff0000");
    addEventPanel.add(new widgets.Label()
        .setText("add a new event").setFontSize(18)
        .setW(319).setH(40).setTx(0)
        );
    addEventPanel.add(new widgets.PushButton()
        .setText("back").setW(100).setH(30)
        .setLeft(10).setAnchorLeft(true)
        .setBottom(10).setAnchorBottom(true)
        .onAction(function() {
            nav.pop();
        })
        );
    addEventPanel.setVisible(false);
    
    nav.register(panel);
    nav.register(addEventPanel);
    nav.createTransition("addEvent",panel,addEventPanel,"easeIn");
    
    var g = new amino.ProtoGroup();
    g.add(panel);
    g.add(addEventPanel);
    return g;
}
switcher.add(buildApp6(stage));

nav.setSize(320,480);

switcherPanel.add(new widgets.PushButton().setText("<")
    .setW(100).setH(30)
    .setBottom(0).setAnchorBottom(true)
    .onAction(switcher.slidePrev));
switcherPanel.add(new widgets.PushButton().setText("switch")
    .setW(100).setH(30)
    .setLeft(101).setAnchorLeft(true)
    .setRight(101).setAnchorRight(true)
    .setBottom(0).setAnchorBottom(true)
    .onAction(switcher.zoomAll));
switcherPanel.add(new widgets.PushButton().setText(">")
    .setW(100).setH(30)
    .setTx(320-100)
    .setRight(0).setAnchorRight(true)
    .setBottom(0).setAnchorBottom(true)
    .onAction(switcher.slideNext)
    );

function Switcher() {
    var current = 0;
    this.apps = [];
    this.root = null;
    this.add = function(app) {
        this.root.add(app);
        this.apps.push(app);
        core.on("drag",app,this.dragHandler);
        core.on("release",app,this.releaseHandler);
    }
    this.slide = function(i,rect) {
        var dur = 200;
        var anim;
        if(self.zoomedin) {
            var xoff = (i-current)*switcherPanel.getW();
            anim = core.createPropAnim(rect, "tx", rect.getTx(), xoff, dur, 1, false);
        } else {
            var xoff = (i-current)*switcherPanel.getW()*1.2;
            anim = core.createPropAnim(rect, "tx", rect.getTx(), switcherPanel.getW()/4+xoff/2, dur, 1, false);
        }
        anim.setInterpolator(amino.Interpolators.CubicInOut);
    }
    
    this.zoomit = function(i,rect) {
        var dur = 300;
        var xoff = (i-current)*switcherPanel.getW()*1.2;
        if(self.zoomedin) {
            //zoom out
            var anims = [];
            anims[0] = core.createPropAnim(rect,"scalex",1,0.5, dur, 1, false);
            anims[1] = core.createPropAnim(rect,"scaley",1,0.5, dur, 1, false);
            anims[2] = core.createPropAnim(rect,"tx",0+xoff, switcherPanel.getW()/4 + xoff/2, dur, 1, false);
            anims[3] = core.createPropAnim(rect,"ty",0,40, dur, 1, false);
            anims.forEach(function(a) {
                a.setInterpolator(amino.Interpolators.CubicInOut);
            });
        } else {
            //zoom in
            var anims = [];
            anims[0] =  core.createPropAnim(rect,"scalex",0.5,1, dur, 1, false);
            anims[1] = core.createPropAnim(rect,"scaley",0.5,1, dur, 1, false);
            anims[2] = core.createPropAnim(rect,"tx",switcherPanel.getW()/4+xoff/2,0+xoff, dur, 1, false);
            anims[3] = core.createPropAnim(rect,"ty",40,0, dur, 1, false);
            anims.forEach(function(a) {
                a.setInterpolator(amino.Interpolators.CubicInOut);
            });
        }
    }
    
    var self = this;
    this.dragHandler = function(e) {
        self.apps.forEach(function(v) {
            v.setTx(v.getTx()+e.dx);
        });
    }

    this.releaseHandler = function(e) {
        var n = self.apps.indexOf(e.target);
        var xoff = (n-current)*switcherPanel.getW()*1.2;
        var targetX = switcherPanel.getW()/4 + xoff/2;
        var actualX = e.target.getTx();
        if(actualX < targetX-switcherPanel.getW()/3) {
            self.slideNext();
            return;
        }
        if(actualX > targetX+switcherPanel.getW()/3) {
            self.slidePrev();
            return;
        }
        
        for(var i in self.apps) {
            self.slide(i,self.apps[i]);
        }
    }
    
    
    this.slideNext = function() {
        current = current+1;
        if(current > self.apps.length-1) current = self.apps.length-1;
        for(var i in self.apps) {
            self.slide(i,self.apps[i]);
        }
    }
    
    this.slidePrev = function() {
        current = current-1;
        if(current < 0) current = 0;
        for(var i in self.apps) {
            self.slide(i,self.apps[i]);
        }
    }
    
    this.zoomedin = true;

    this.zoomAll = function() {
        for(var i in self.apps) {
            self.zoomit(i,self.apps[i]);
        }
        self.zoomedin = !self.zoomedin;
    }
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
        
        core.createPropAnim(trans.src, "tx", 0, -stage.width, 250, 1, false);
        core.createPropAnim(trans.dst, "tx", stage.width,  0, 250, 1, false);
        this.navstack.push(trans);
        trans.dst.setVisible(true);
    }
    this.pop = function() {
        var trans = this.navstack.pop();
        core.createPropAnim(trans.src, "tx", -400, 0, 250, 1, false);
        core.createPropAnim(trans.dst, "tx", 0,  400, 250, 1, false)
            .after(function() { trans.dst.setVisible(false); });
    }
    this.insets = {
        top: 20,
        bottom: 30,
        left: 0,
        right: 0,
    };
    this.setSize = function(w,h) {
        for(var i in self.panels) {
            var panel = self.panels[i];
            panel.setW(w-this.insets.left-this.insets.right)
            .setH(h-this.insets.top-this.insets.bottom);
            panel.setTy(this.insets.top);
            panel.setTx(this.insets.left);
        }
    }
    var self = this;
    stage.on("WINDOWSIZE", stage, function(e) {
        self.setSize(e.width,e.height);
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


});
