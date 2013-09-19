var amino = null;
if(process.platform == 'darwin') {
    amino = require('../../build/desktop/amino.js');
} else {
    amino = require('./amino.js');    
}
function Switcher() {
    var current = 0;
    this.apps = [];
    this.root = null;
    this.switcherPanel = null;
    
    
    this.add = function(app) {
        this.root.add(app);
        this.apps.push(app);
        this.core.on("drag",app,this.dragHandler);
        this.core.on("release",app,this.releaseHandler);
    }
    this.onZoomIn = null;
    this.onZoomOut = null;
    
    this.slide = function(i,rect) {
        var dur = 200;
        var anim;
        if(self.zoomedin) {
            var xoff = (i-current)*this.switcherPanel.getW();
            anim = this.core.createPropAnim(rect, "tx", rect.getTx(), xoff, dur);
        } else {
            var xoff = (i-current)*this.switcherPanel.getW()*1.2;
            anim = this.core.createPropAnim(rect, "tx", rect.getTx(), this.switcherPanel.getW()/4+xoff/2, dur);
        }
        anim.setInterpolator(amino.Interpolators.CubicInOut);
    }
    
    this.zoomit = function(i,rect) {
        var dur = 300;
        var yoff = 80;
        var xoff = (i-current)*this.switcherPanel.getW()*1.2;
        if(self.zoomedin) {
            //zoom out
            rect.setVisible(true);
            var anims = [];
            anims[0] = this.core.createPropAnim(rect,"scalex",1,0.5, dur);
            anims[1] = this.core.createPropAnim(rect,"scaley",1,0.5, dur);
            anims[2] = this.core.createPropAnim(rect,"tx",0+xoff, this.switcherPanel.getW()/4 + xoff/2, dur);
            anims[3] = this.core.createPropAnim(rect,"ty",0,yoff, dur);
            anims.forEach(function(a) {
                a.setInterpolator(amino.Interpolators.CubicInOut);
            });
        } else {
            //zoom in
            var anims = [];
            anims[0] = this.core.createPropAnim(rect,"scalex",0.5,1, dur);
            anims[1] = this.core.createPropAnim(rect,"scaley",0.5,1, dur);
            anims[2] = this.core.createPropAnim(rect,"tx",this.switcherPanel.getW()/4 + xoff/2,0+xoff, dur);
            anims[3] = this.core.createPropAnim(rect,"ty",yoff,0, dur);
            anims.forEach(function(a) {
                a.setInterpolator(amino.Interpolators.CubicInOut);
            });
            anims[3].after(function() {
                if(i != current) {
                    rect.setVisible(false);
                }
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
        var xoff = (n-current)*this.switcherPanel.getW()*1.2;
        var targetX = this.switcherPanel.getW()/4 + xoff/2;
        var actualX = e.target.getTx();
        if(actualX < targetX-this.switcherPanel.getW()/3) {
            self.slideNext();
            return;
        }
        if(actualX > targetX+this.switcherPanel.getW()/3) {
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
        if(self.zoomedin) {
        if(self.onZoomIn) {
            self.onZoomIn();
        }
        } else {
        if(self.onZoomOut) {
            self.onZoomOut();
        }
        }
    }
    
    
}

exports.Switcher = Switcher;
