var amino = null;
if(process.platform == 'darwin') {
    amino = require('../../build/desktop/amino.js');
} else {
    amino = require('./amino.js');    
}
function Switcher() {
    var yoff = 80;
    current = 0;
    this.apps = [];
    this.root = null;
    this.switcherPanel = null;
    this.zoomedin = true;
    
    
    this.delayedAdd = function(app) {
        for(var i=0; i<this.apps.length; i++) {
            var ap = this.apps[i];
            if(i <= current) {
                var xoff = (i-current-1)*self.switcherPanel.getW();
                amino.getCore().createPropAnim(ap,'tx', ap.getTx(), self.switcherPanel.getW()/4+xoff/2, 200);
            }
        }
        setTimeout(function() {
           self.add(app);
        },250);
    }
    this.add = function(app) {
        console.log('adding an app');
        this.root.add(app);
        this.apps.splice(current+1, 0, app);
        //this.core.on("drag",app,this.dragHandler);
        //this.core.on("release",app,this.releaseHandler);
        if(this.zoomedin) {
        } else {
            app.setTx(100).setScalex(0.5).setScaley(0.5);
            amino.getCore().createPropAnim(app,'ty',480, 80, 200);
        }
        current++;
    }
    this.onZoomIn = null;
    this.onZoomOut = null;
    
    this.slide = function(i,rect) {
        var dur = 200;
        var anim;
        if(self.zoomedin) {
            var xoff = (i-current)*this.switcherPanel.getW();
            anim = this.core.createPropAnim(rect, "tx", rect.getTx(), xoff, dur);
            rect.setTy(yoff);
        } else {
            var xoff = (i-current)*this.switcherPanel.getW()*1.2;
            anim = this.core.createPropAnim(rect, "tx", rect.getTx(), this.switcherPanel.getW()/4+xoff/2, dur);
            rect.setTy(yoff);
        }
        anim.setInterpolator(amino.Interpolators.CubicInOut);
    }
    
    this.zoomit = function(i,rect) {
        var dur = 300;
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
    var sx = 0;
    this.pressHandler = function(e) {
        self.sx = e.x;
    }
    this.dragHandler = function(e) {
        var x = self.apps[current].getTx();
        console.log("current = " + current + " x = " + x + " dx = " + e.dx);
        if(Math.abs(e.dx) > 50) return;
        self.apps.forEach(function(v) {
            v.setTx(v.getTx()+e.dx);
        });
    }

    this.releaseHandler = function(e) {
        if(Math.abs(e.x - self.sx) < 15) {
            console.log("didn't move");
            self.zoomAll();
            return;
        }
        for(var i = 0; i< self.apps.length; i++) {
            var app = self.apps[i];
            var x = app.getTx();
            var w = this.switcherPanel.getW();
            var sh = w/4 + i*w*1.2/2  - current*w*1.2/2;
            var sh2 = Math.round((x-w/4)/(w*1.2/2));
            console.log("should = " + sh + " actual = " + x + " sh2 = " + sh2);
            if(sh2 == 0) current = i;
            console.log("new current = " + current);
            //app.setTx(sh);
        }
        for(var i = 0; i< self.apps.length; i++) {
            var app = self.apps[i];
            var xoff = (i-current)*this.switcherPanel.getW()*1.2;
            app.setTx(w/4 + xoff/2);
        }
        
        //console.log("current = " + current + " x = " + x + " w = " + w + " x/w = " + (x/w) + " sh = " + sh);
        //console.log("n = " + Math.round(x/w));
        /*
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
        }*/
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
    
    this.setCurrent = function(c) {
        current = c;
    }
    
}

exports.Switcher = Switcher;
