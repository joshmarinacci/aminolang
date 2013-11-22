var amino = require('../../build/desktop/amino.js');
var Global = require('./Global.js');
var TabView = require('./TabView.js');
exports.WindowView = amino.ComposeObject({
    type:"WindowView",
    extend: amino.ProtoWidget,
    comps: {
        border: {
            proto: amino.ProtoRect,
        },
        background: {
            proto: amino.ProtoRect,
            promote: ['fill'],
        },
        contents: {
            proto: amino.ProtoGroup,
        },
        titlebar: {
            proto: amino.ProtoRect,
        },
        tabholder: {
            proto: amino.ProtoGroup,
        },
        grabber: {
            proto: amino.ProtoRect,
        },
    },
    props: {
        w: {
            value: 300,
            set: function(w) {
                this.props.w = w;
                this.markDirty();
                this.updateChildrenSizes();
                return this;
            }
        },
        h: {
            value: 200,
            set: function(h) {
                this.props.h = h;
                this.markDirty();
                this.updateChildrenSizes();
                return this;
            }
        },
        
        draggable: {
            value: true,
        },
        
        resizable: {
            value: true,
            set: function(resizable) {
                this.props.resizable = resizable;
                this.comps.grabber.setVisible(resizable);
                return this;
            }
        },
    },
    init: function() {
        this.comps.base.add(this.comps.border);
        this.comps.base.add(this.comps.background);
        this.comps.base.add(this.comps.contents);
        this.comps.base.add(this.comps.grabber);
        this.comps.base.add(this.comps.titlebar);
        this.comps.base.add(this.comps.tabholder);
        
        this.comps.border.setFill("#000000").setTx(-1).setTy(-1);
        this.comps.background.setFill("#eeeeee");
        this.comps.contents.setTy(30).setId("window contents").setCliprect(1);
        
        this.comps.contents.parent = this;
        
        this.comps.titlebar.setW(100).setH(30).setFill("#cccccc");
        this.comps.grabber.setW(20).setH(20).setFill("#555555");
        
        var self = this;
        
        this.updateChildrenSizes = function() {
            var h = this.getH();
            this.comps.border.setH(h+2);
            this.comps.background.setH(h);
            this.comps.contents.setH(h-30);
            this.comps.tabholder.setH(30);
            var g = this.comps.grabber;
            g.setTy(h-g.getH());
            
            this.comps.contents.children.forEach(function(ch) {
                if(ch.setH) ch.setH(h-30);
                if(ch.setTy) ch.setTy(0);
            });            
            
            var w = this.getW();
            this.comps.border.setW(w+2);
            this.comps.background.setW(w);
            this.comps.contents.setW(w);
            this.comps.titlebar.setW(w);
            this.comps.tabholder.setW(w);
            this.comps.grabber.setTx(w-this.comps.grabber.getW());
            
            this.comps.contents.children.forEach(function(ch) {
                if(ch.setW) ch.setW(w);
                if(ch.setTx) ch.setTx(0);
            });            
            
        }
        
        this.validate = function() {
            this.updateChildrenSizes();
        };
        
        amino.getCore().on("drag",this.comps.grabber,function(e) {
            self.setW(self.getW()+e.dx);
            self.setH(self.getH()+e.dy);
        });
        
        amino.getCore().on("press",this.comps.titlebar, function(e) {
            if(!self.getDraggable()) return;
            self.parent.raiseToTop(self);
        });
        amino.getCore().on("drag",this.comps.titlebar, function(e) {
            if(!self.getDraggable()) return;
            self.setTx(self.getTx()+e.dx);
            self.setTy(self.getTy()+e.dy);
        });
        
        this.markDirty = function() {
            this.dirty = true;
            amino.dirtylist.push(this);
        }

        this.contains = undefined;
        this.children = [
            this.comps.background,
            this.comps.contents, 
            this.comps.titlebar,
            this.comps.tabholder, 
            this.comps.grabber,
        ];
        
        this.addTab = function(view, title) {
            this.comps.contents.add(view);
            var count = this.comps.tabholder.children.length;
            var tab = new TabView.TabView().setText(title).setTx(count*150);
            tab.window = this;
            tab.content = view;
            this.comps.tabholder.add(tab);
            tab.setTx(count*150);
            this.markDirty();
        };
        
        this.addExistingTab = function(tab) {
            this.comps.contents.add(tab.content);
            var h = this.getH();
            var w = this.getW();
            this.comps.contents.children.forEach(function(ch) {
                if(ch.setW) ch.setW(w);
                if(ch.setH) ch.setH(h-30);
                if(ch.setTy) ch.setTy(0);
            });
            var count = this.comps.tabholder.children.length;
            tab.window = this;
            this.comps.tabholder.add(tab);
            tab.setTx(count*150);
            this.markDirty();
        }
        
        this.layoutTabs = function() {
            //re-sort them by tx
            var arr = [];
            this.comps.tabholder.children.forEach(function(tab) {
                arr[tab.getTx()] = tab;
            });
            //layout again in the new order
            var tx = 0;
            arr.forEach(function(tab) {
                tab.setTx(tx);
                tx+= 150;
            });
        }
        
        this.getTabCount = function() {
            return this.comps.tabholder.children.length;
        }
        Global.windowlist.push(this);        
        
        this.destroy = function() {
            Global.windows.remove(this);
            var n = Global.windowlist.indexOf(this);
            Global.windowlist.splice(n,1);
            this.markDirty();
        }
        
        this.removeTab = function(tab) {
            this.comps.contents.remove(tab.content);
            this.comps.tabholder.remove(tab);
            this.layoutTabs();
            this.markDirty();
        }
        
        this.raiseContentToFront = function(content) {
            this.comps.contents.raiseToTop(content);
            this.markDirty();
        }
        
        this.markDirty();
    }
});

