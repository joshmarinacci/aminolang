var amino = null;
var widgets = null;
if(process.platform == 'darwin') {
    amino = require('../../build/desktop/amino.js');
    widgets = require('../../build/desktop/widgets.js');
} else {
    amino = require('./amino.js');    
    widgets = require('./widgets.js');
}



var data = require('./fakedata.js');
var Switcher = require('./switcher.js').Switcher;
var EmailApp = require('./emailapp.js').EmailApp;
var LockScreen = require('./lockscreen.js').LockScreen;
var dialer = require('./dialer.js');
var fs = require('fs');

amino.startApp(function(core, stage) {
    stage.setSize(320,480);

    var superroot = new amino.ProtoGroup();
    stage.setRoot(superroot);
    
    var ww = 320;
    function getWW() {
        return ww;
    }
    var wh = 480;
    function getWH() {
        return wh;
    }

var nav = new NavigationManager();
nav.insets.bottom = 30+20;
nav.insets.top = 0;

function buildStatusBar(stage)  {
    var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    
    var time = new widgets.Label();
    time.setFontSize(12);
    time.setH(20);
    time.setText("00.00:00 00/00");
    time.setFill("#ffffff");
    setInterval(function(){
        var date = new Date();
        var txt = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds()
        + "    " + months[date.getMonth()] + "/"+date.getDay() + "/" + date.getFullYear();
        time.setText(txt);
    },1000);
    
    var panel = new widgets.AnchorPanel();
    panel.setW(getWW()).setH(20);
    panel.setFill("#B65C00");
    panel.add(time);
    
    return panel;
}

function buildSearch() {
    var search = new amino.ProtoGroup();
    var tf = new widgets.TextField().setText('');
    stage.on("change",tf,function(e) {
        if(e.name=='text') {
            console.log(e.text);
        }
    });
    stage.on("focusgain",tf,function() {
        var kb = new SoftKeyboard().setW(getWW()).setH(140).setTy(getWH()-140);
        kb.setTargetTextControl(tf);
        superroot.add(kb);
    });
    stage.on('focusloss',tf,function() {
       console.log("lost the focus");
    });
    tf.setW(200).setH(30);
    search.add(tf);
    /*
    var bg = new amino.ProtoRect().setW(getWW()).setH(40).setFill("#ffffcc");
    search.add(bg);
    search.add(new amino.ProtoText().setText("search").setTx(10).setTy(20));
    */
    stage.on("WINDOWSIZE", stage, function(e) {
        tf.setW(getWW());
    });
    return search;
}
var search = buildSearch();


var switcherPanel = new widgets.AnchorPanel();
switcherPanel.setW(getWW()).setH(getWH());
switcherPanel.setFill("#333333");
stage.on("windowsize", stage, function(e) {
    console.log('window has been resized: ' + stage.getW(), " ", e.width);
    ww = e.width;
    wh = e.height;
    switcherPanel.setW(getWW());
    switcherPanel.setH(getWH());
});
superroot.add(switcherPanel);


switcherPanel.add(search);
var statusBar = buildStatusBar(stage);
statusBar.setAnchorLeft(true).setAnchorRight(true);
statusBar.setAnchorTop(true);
switcherPanel.add(statusBar);

var root = new amino.ProtoGroup();
root.setTy(20);
switcherPanel.add(root);


var switcher = new Switcher();
switcher.core = core;
switcher.root = root;
switcher.switcherPanel = switcherPanel;

function buildDock(stage) {
    var dock = new amino.ProtoGroup().setTy(480);
    var bg = new amino.ProtoRect().setW(getWW()).setH(80)
        .setFill("#ffffff").setOpacity(0.5);
    var apps = [
        { icon:'\uF0E0', fill: "#ff5555", color: "#ffffff", gen: function() {  return new EmailApp(stage,nav,data); } },
        { icon:'\uF095', fill: "#f0b035", color: "#444444", gen: function() {  return dialer.Dialer(stage,nav,data); } },
        { icon:'\uF030', fill: "#6666ff", color: "#eeeeff", gen: function() {  return buildApp2(stage) } },
        { icon:'\uF073', fill: "#22cc22", color: "#ffffff", gen: function() {  return buildApp6(stage); } },
    ];
    dock.add(bg);
    var x = 0;
    apps.forEach(function(app) {
        dock.add(new widgets.PushButton()
            .setW(60).setH(60)
            .setFontSize(40)
            .setFill(app.fill)
            .setColor(app.color)
            .setFontName('awesome')
            .setTx(x*80+10).setTy(10)
            .setText(app.icon)
            .onAction(function() {
                switcher.add(app.gen());
                nav.setSize(getWW(),getWH());
            })
            );
        x++;
    });
    stage.on("WINDOWSIZE", stage, function(e) {
        bg.setW(getWW());
        dock.setTy(getWH());
    });
    return dock;
}
var dock = buildDock(stage);


switcherPanel.add(dock);
var scrim = new amino.ProtoRect().setW(getWW()).setH(getWH()-20-30 - 80-30).setTy(20+30).setVisible(0).setOpacity(0.0).setFill("#0000ff");
core.on('press',scrim, function() {
    switcher.zoomAll();
});
switcher.onZoomIn = function() {
    var anim =  core.createPropAnim(dock,"ty",getWH()-110,getWH(), 300);
    var animx = core.createPropAnim(dock,'rotateX',0,-90, 300);
    var anim2 = core.createPropAnim(search,"ty",20,-50, 300);
    scrim.setVisible(0);
};
switcher.onZoomOut = function() {
    var anim = core.createPropAnim(dock,"ty",getWH(),getWH()
        -110, 300);
    var animx = core.createPropAnim(dock,'rotateX',-90,0, 400);
    var anim2 = core.createPropAnim(search,"ty",-50,20, 300);
    scrim.setVisible(1);
};




function buildTodoList(stage,nav) {
    var panel = new widgets.AnchorPanel();
    panel.setFill("#F9BE00");
    var lv = new widgets.ListView();
    lv.setW(320).setH(200)
    .setTop(30).setAnchorTop(true)
    .setBottom(40+20).setAnchorBottom(true)
    .setLeft(0).setAnchorLeft(true)
    .setRight(0).setAnchorRight(true)
    ;
    lv.setModel(data.people);
    lv.setTextCellRenderer(function(cell,i,item) {
        if(item == null) return;
        cell.setText(item.first + " " + item.last);
    });
    panel.add(lv);
    
    
    panel.add(new widgets.Label()
        .setText("Todo List").setFontSize(20)
        .setAnchorLeft(true).setLeft(0)
        .setAnchorRight(true).setRight(0)
        .setAnchorTop(true).setTop(0)
        );
    panel.add(new widgets.PushButton()
            .setText("Add")
            .setBottom(10).setAnchorBottom(true)
            .setLeft(10).setAnchorLeft(true)
            .setW(100).setH(30)
            );
    panel.add(new widgets.PushButton()
            .setText("notify")
            .setBottom(10).setAnchorBottom(true)
            .setRight(10).setAnchorRight(true)
            .setW(100).setH(30)
            .onAction(function(){ generateFakeNotification(); })
            );
    
    nav.register(panel);
    return panel;
    };
switcher.add(buildTodoList(stage,nav));


function buildApp2(stage) {
    var panel = new widgets.AnchorPanel();
    //listview of the gallery
    
    var lv = new widgets.ListView()
        .setW(320).setH(300)
        .setCellWidth(Math.floor(320/3)).setCellHeight(100)
        .setTop(0).setAnchorTop(true)
        .setBottom(60).setAnchorBottom(true)
        .setLayout('flow')
        ;
    panel.add(lv);
    

    
    panel.add(new widgets.PushButton()
            .setText("snap photo")
            .setW(150).setH(30)
            .setLeft(5).setAnchorLeft(true)
            .setBottom(5).setAnchorBottom(true)
            );
    panel.add(new widgets.PushButton()
            .setText("gallery")
            .setW(150).setH(30)
            .setRight(5).setAnchorRight(true)
            .setBottom(5).setAnchorBottom(true)
            );
    nav.register(panel);
    return panel;            
    }
//switcher.add(buildApp2(stage));


//switcher.add(new EmailApp(stage,nav,data));
/*
function buildApp4(stage) {
    var panel = new widgets.AnchorPanel();
    panel.add(new widgets.PushButton()
        .setText("Prev")
        .setBottom(10).setAnchorBottom(true)
        .setW(100).setH(30).setTx(0).setTy(400));
    panel.add(new widgets.PushButton()
        .setText("Play")
        .setBottom(10).setAnchorBottom(true)
        .setW(100).setH(30).setTx(105).setTy(400));
    panel.add(new widgets.PushButton()
        .setText("Next")
        .setBottom(10).setAnchorBottom(true)
        .setW(100).setH(30).setTx(211).setTy(400));
    nav.register(panel);
    return panel;
}
switcher.add(buildApp4(stage));
*/
/*
switcher.add(dialer.Dialer(stage,nav,data));
*/


function buildApp6(stage) {
    var panel = new widgets.AnchorPanel();
    panel.setId("calendarpanel");
    panel.add(new widgets.Label()
        .setText("Today: 3/3/33").setFontSize(15)
        .setW(320).setH(30)
        .setTop(0)
        );
    var lv = new widgets.ListView();
    lv.setW(320).setH(200)
        .setTop(30).setAnchorTop(true)
        .setBottom(40+20).setAnchorBottom(true)
        .setLeft(0).setAnchorLeft(true)
        .setRight(0).setAnchorRight(true)
        ;
    panel.add(lv);
    lv.setModel(data.events);
    console.log(data.events);
    lv.setTextCellRenderer(function(cell,i,item) {
        if(!item) {
            cell.setText("");
            return;
        }
        var date = new Date(item.datetime.year,
            item.datetime.month,
            item.datetime.day,
            item.datetime.hour, 
            item.datetime.minute,0);
        cell.setText(item.title + ", " 
            + item.datetime.hour +":"
            + item.datetime.minute);
    });
    
    panel.add(new widgets.PushButton()
        .setText("add event")
        .setId("addEvent")
        .setW(100).setH(30).setTx(5)
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
        .setText("add a new event").setFontSize(15)
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
//switcher.add(buildApp6(stage));




nav.setSize(getWW(),getWH());

switcherPanel.add(scrim);

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


function generateFakeNotification() {
    var panel = new widgets.AnchorPanel()
        .setFill("#ffff55");
    panel.add(new widgets.Label().setText("stuff happened"));
    panel.add(new widgets.PushButton().setText("X")
            .setW(30).setH(30)
            .setAnchorRight(true).setRight(10)
            .onAction(function() {
                    superroot.remove(panel);
                    panel.setVisible(false);
                    nav.setSize(getWW(),getWH());
            })
            );
    panel.setW(320).setH(80);
    panel.setTy(getWH()-80-30);
    nav.setSize(getWW(),getWH()-80);
    superroot.add(panel);
}

superroot.add(new LockScreen(core,stage));

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
        
        core.createPropAnim(trans.src, "tx", 0, -getWW(), 250);
        core.createPropAnim(trans.dst, "tx", getWW(),  0, 250);
        this.navstack.push(trans);
        trans.dst.setVisible(true);
    }
    this.pop = function() {
        var trans = this.navstack.pop();
        core.createPropAnim(trans.src, "tx", -400, 0, 250);
        core.createPropAnim(trans.dst, "tx", 0,  400, 250)
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
            //panel.setTx(this.insets.left);
        }
    }
    var self = this;
    stage.on("WINDOWSIZE", stage, function(e) {
        self.setSize(getWW(),getWH());
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



SoftKeyboard = amino.ComposeObject({
    type:"SoftKeyboard",
    extend: amino.ProtoWidget,
    comps: {
        background: {
            proto: amino.ProtoRect,
            promote: ['w','h','fill'],
        }
    },
    init: function() {
        this.setFill("#888888");
        this.comps.base.add(this.comps.background);
        var keysvals = [
            ['Q','W','E','R','T','Y','U','I','O','P'],
            ['A','S','D','F','G','H','J','K','L'],
            ['Z','X','C','V','B','N','M'],
        ];
        var rowoffset = [5,20,50];
        var keyw = 30;
        var keyh = 30;
        var gapw = 2;
        var gaph = 2;
        
        var keybgs = [];
        for(var r=0; r<keysvals.length; r++) {
            var row = keysvals[r];
            var off = rowoffset[r];
            for(var i=0; i<row.length; i++) {
                var ch = row[i];
                var keybg = new amino.ProtoRect().setW(keyw).setH(keyh)
                    .setTx(i*(keyw+gapw)+off).setTy(r*(keyh+gaph))
                    .setFill("#e0e0e0");
                keybg.ch = ch;
                this.comps.base.add(keybg);
                var keytext = new amino.ProtoText()
                    .setTx(i*(keyw+gapw)+3+off).setTy(20+r*(keyh+gaph))
                    .setFill("#000000").setText(ch);
                this.comps.base.add(keytext);
                keybgs.push(keybg);
            }
        }
        this.shiftOn = false;
        var self = this;
        amino.getCore().on('press',this,function(e) {
            keybgs.forEach(function(key) {
                var x = e.point.x - key.getTx();
                var y = e.point.y - key.getTy();
                if(key.contains(x,y)) {
                    amino.getCore().fireEvent({
                            type:'softkeypress',
                            source:self,
                            key:key.ch,
                    });
                    if(self.tf) {
                        var ch = key.ch;
                        if(self.shiftOn) {
                            ch = ch.toUpperCase();
                        } else {
                            ch = ch.toLowerCase();
                        }
                        self.tf.insertStringAtCursor(ch);
                    }
                }
            });
        });
        
        this.children = [];
        this.isParent = function() { return true; }
        
        this.setTargetTextControl = function(tf) {
            this.tf = tf;
        }

        var done = new widgets.PushButton()
            .setText('done').onAction(function() {
                self.setVisible(false);
                delete self.tf;
            })
            .setW(80).setH(keyh).setTx(235).setTy(100)
            ;
        this.comps.base.add(done);
        this.children.push(done);
        
        var deletechar = '\uF137';
        var bs = new widgets.PushButton()
            .setFontName('awesome')
            .setText(deletechar).onAction(function() {
                if(self.tf) {
                    self.tf.tc.cursor.deleteChar();
                }
            })
            .setW(40).setH(keyh).setTx(280).setTy(65)
            ;
        this.comps.base.add(bs);
        this.children.push(bs);
        
        
        var space = new widgets.PushButton()
            .setW(120).setH(keyh).setTx(100).setTy(100)
            .setText("space").onAction(function() {
                if(self.tf) {
                    self.tf.insertStringAtCursor(" ");//tc.cursor.deleteChar();
                }
            });
        this.comps.base.add(space);
        this.children.push(space);
        
        var shiftchar = '\uF062';
        var shift = new widgets.PushButton()
            .setFontName('awesome')
            .setText(shiftchar).onAction(function() {
                self.shiftOn = !self.shiftOn;
                if(self.shiftOn) {
                    shift.setFill("#00ffff");
                } else {
                    shift.setFill("#aaee88");
                }
            })
            .setW(40).setH(keyh).setTx(5).setTy(65)
            ;
        this.comps.base.add(shift);
        this.children.push(shift);
        
        

    },
});

/*
var http = require('http');
var req = http.request({
        hostname:"stash.lv",
        port:3001,
        path:'/bag/unread?token=joshsecret&omit=description',
        method:'GET',
        //http://stash.lv:3001/bag/unread?token=joshsecret&omit=description
        //http://stash.lv:3001/bag/search?token=joshsecret&type=todo
        //http://stash.lv:3001/bag/search?token=joshsecret&type=bookmark
},function(res) {
    console.log("done with the request");
    console.log('status = ', res.statusCode);
    res.setEncoding('utf8');
    var data = "";
    res.on('data',function(chunk) {
            data += chunk.toString();
    });
    res.on('end', function() {
        var dt = JSON.parse(data);
        dt.forEach(function(item) {
                console.log(item.title);
        });
    });
});
req.end();
*/

});
