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
    this.add = function(app) {
        this.root.add(app);
        this.apps.push(app);
        this.core.on("drag",app,this.dragHandler);
        this.core.on("release",app,this.releaseHandler);
    }
    this.slide = function(i,rect) {
        var dur = 200;
        var anim;
        if(self.zoomedin) {
            var xoff = (i-current)*this.switcherPanel.getW();
            anim = this.core.createPropAnim(rect, "tx", rect.getTx(), xoff, dur, 1, false);
        } else {
            var xoff = (i-current)*this.switcherPanel.getW()*1.2;
            anim = this.core.createPropAnim(rect, "tx", rect.getTx(), this.switcherPanel.getW()/4+xoff/2, dur, 1, false);
        }
        anim.setInterpolator(amino.Interpolators.CubicInOut);
    }
    
    this.zoomit = function(i,rect) {
        var dur = 300;
        var xoff = (i-current)*this.switcherPanel.getW()*1.2;
        if(self.zoomedin) {
            //zoom out
            var anims = [];
            anims[0] = this.core.createPropAnim(rect,"scalex",1,0.5, dur, 1, false);
            anims[1] = this.core.createPropAnim(rect,"scaley",1,0.5, dur, 1, false);
            anims[2] = this.core.createPropAnim(rect,"tx",0+xoff, this.switcherPanel.getW()/4 + xoff/2, dur, 1, false);
            anims[3] = this.core.createPropAnim(rect,"ty",0,40, dur, 1, false);
            anims.forEach(function(a) {
                a.setInterpolator(amino.Interpolators.CubicInOut);
            });
        } else {
            //zoom in
            var anims = [];
            anims[0] = this.core.createPropAnim(rect,"scalex",0.5,1, dur, 1, false);
            anims[1] = this.core.createPropAnim(rect,"scaley",0.5,1, dur, 1, false);
            anims[2] = this.core.createPropAnim(rect,"tx",this.switcherPanel.getW()/4+xoff/2,0+xoff, dur, 1, false);
            anims[3] = this.core.createPropAnim(rect,"ty",40,0, dur, 1, false);
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
    }
}

exports.Switcher = Switcher;
