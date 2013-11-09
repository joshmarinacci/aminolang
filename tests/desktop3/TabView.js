var amino = require('../../build/desktop/amino.js');
var widgets = require('../../build/desktop/widgets.js');
var Global = require('./Global.js');

exports.TabView = amino.ComposeObject({
    type: "Tabview",
    extend: amino.ProtoWidget,
    comps: {
        background: {
            proto: amino.ProtoRect,
            promote: ['fill'],
        },
        title: {
            proto: widgets.Label,
            promote: ['text'],
        },
        closeButton: {
            proto: widgets.PushButton,
        },
    },
    props: {
        w: {
            value: 100,
            set: function(w) {
                this.props.w = w;
                this.comps.background.setW(w);
                return this;
            }
        },
        h: {
            value: 30,
            set: function(h) {
                this.props.h = h;
                this.comps.background.setH(h);
                return this;
            }
        },
    },
    init: function() {
        this.comps.base.add(this.comps.background);
        this.comps.base.add(this.comps.title);
        this.comps.base.add(this.comps.closeButton);
        this.comps.background.setW(100).setH(30).setFill("#dddddd");
        this.comps.closeButton
            .setW(20).setH(20).setTx(110).setTy(5)
            .setFontName('awesome').setFontSize(20)
            .setText("\uf057")
            ;
        this.comps.title.setText("foo").setTx(3).setTy(3);
        this.setW(140).setH(30);
        var self = this;
        var ty = 0;
        var broken = false;
        this.children = [
            this.comps.closeButton,
        ];
        
        amino.getCore().on("action",this.comps.closeButton, function(e) {
                if(self.window.getTabCount() == 1) {
                    self.window.destroy();
                } else {
                    self.window.removeTab(self);
                }
        });
        amino.getCore().on("press",this,function(e) {
            self.window.raiseContentToFront(self.content);
            Global.windows.raiseToTop(self.window);
        });
        amino.getCore().on("drag",this, function(e) {
            if(broken || self.window.getTabCount() == 1) {
                //drag the whole window
                var nx = self.window.getTx()+e.dx;
                if(nx < 0) nx = 0;
                self.window.setTx(nx);
                self.window.setTy(self.window.getTy()+e.dy);
                
                var pt = amino.getCore().localToGlobal(e.point,e.target);
                Global.windowlist.forEach(function(win) {
                    var tb = win.comps.titlebar;
                    var lpt = amino.getCore().globalToLocal(pt,tb);
                    if(tb.contains(lpt.x,lpt.y) && tb != self.window.comps.titlebar) {
                        Global.mergeWindow(self,win,pt);
                        broken = false;
                    }
                });
                return;
            } else {
                //just drag the tab
                self.setTx(self.getTx()+e.dx);
                ty += e.dy;
            }
            if(ty < -20 || ty > self.getH()+20) {
                if(self.window.getTabCount() > 1) {
                    var pt = e.point;
                    pt = amino.getCore().localToGlobal(pt,e.target);
                    Global.splitWindow(self,self.window,pt.x,pt.y);
                    broken = true;
                }
            }
        });
        amino.getCore().on("release",this,function(e) {
            ty = 0;
            broken = false;
            self.window.layoutTabs();
        });
    },
});

