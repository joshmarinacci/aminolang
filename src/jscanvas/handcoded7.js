function p(s) { console.log(s); }

var Events = new Events();

//does platform specific native event handler setup
function attachEvent(node,name,func) {
    if(node.addEventListener) {
        node.addEventListener(name,func,false);
    } else if(node.attachEvent) {
        node.attachEvent(name,func);
    }
};

//converts platform specific points to local coords of the canvas
function calcLocalXY(canvas,event) {
    var docX = -1;
    var docY = -1;
    if (event.pageX == null) {
        // IE case
        var d= (document.documentElement && document.documentElement.scrollLeft != null) ?
             document.documentElement : document.body;
         docX= event.clientX + d.scrollLeft;
         docY= event.clientY + d.scrollTop;
    } else {
        // all other browsers
        docX= event.pageX;
        docY= event.pageY;
    }        
    docX -= canvas.offsetLeft;
    docY -= canvas.offsetTop;
    return new Point(docX,docY);
};		

var old_eventManager = EventManager;

EventManager = function() {
    this.listeners = {};
    this.on = function(name, target, fn) {
        if(!this.listeners[name]) {
            this.listeners[name] = [];
        }
        var list = this.listeners[name];
        list.push({target:target, fn:fn});
    }
    this.createEvent = function() {
        return {};
    }
    this.fireEvent = function(e) {
        if(this.listeners[e.type]) {
            var list = this.listeners[e.type];
            for(var i in list) {
                var l = list[i];
                if(l.target == e.target) l.fn(e);
            }
        }
    }
    
    this.findNode = function(point) {
        //go in reverse, ie: front to back
        for(var i=this.stage.nodes.length-1; i>=0; i--) {
            var node = this.stage.nodes[i];
            var ret = this.real_findNode(node,point);
            if(ret != null) return ret;
        }
        return null;
    }
    
    this.real_findNode = function(node, point) {
        if(!node) return null;
        if(!node.getvisible()) return null;
        var pt2 = new Point(
            point.x-node.gettx(),
            point.y-node.getty()
            );
        
        if(node.isparent && node.isparent()) {
            //go in reverse, front to back
            for(var i=node.getChildCount()-1; i>=0; i--) {
                var ret = this.real_findNode(node.getChild(i),pt2);
                if(ret != null) return ret;
            }
        }
        
        if(node.contains(pt2)) {
            return node;
        }
        return null;
    }
    
}
EventManager.extend(old_eventManager);
var static_em = new EventManager();
EventManager.get = function() {
    return static_em;
}

function CanvasStage(can)  {
    this.domCanvas = can;
    this.add = function(n) {
        this.nodes.push(n);
        n.parent = this;
        return this;
    }
    this.on = function(name, target, fn) {
        EventManager.get().on(name,target,fn);
    }
    
    EventManager.get().stage = this;
    
    this.markDirty = function() {
        this.redraw();
    }
    
    this.anims = [];
    this.addAnim = function(anim) {
        this.anims.push(anim);
    }
    
    this.mousePressed = false;
    
    this.setup = function() {
        var self = this;
        
        attachEvent(this.domCanvas,'mousedown',function(e){
            self.processEvent(Events.Press,self.domCanvas,e);
            self.mousePressed = true;
        });
        attachEvent(this.domCanvas,'mousemove',function(e){
            if(!self.mousePressed) return;
            self.processEvent(Events.Drag,self.domCanvas,e);
            self.mousePressed = true;
        });
        attachEvent(this.domCanvas,'mouseup',function(e){
            self.processEvent(Events.Release,self.domCanvas,e);
            self.mousePressed = false;
        });
        attachEvent(window,'keydown',function(e){
            self.processKeyEvent(Events.KeyPress, self.domCanvas,e);
        });
        if(window.DeviceMotionEvent) {
            console.log("motion IS supported");
            attachEvent(window,'devicemotion',function(e){
                self.processAccelEvent(Events.AccelerometerChanged, e);
            });
        } else {
            console.log("motion not supported");
        }
    }
    this.processKeyEvent = function(type,domCanvas,e) {
        e.preventDefault();
        var event = {
            type:type,
            e:e,
        }
        if(!this.keyboardFocus) {
            console.log("there is no node with the focus. ");
            return;
        }
        
        event.target = this.keyboardFocus
        console.log("key = ", e);
        if(this.listeners[type]) {
            var list = this.listeners[type];
            for(var i in list) {
                var l = list[i];
                if(l.target == event.target) l.fn(event);
            }
        }
    }
    this.processAccelEvent = function(type, e) {
        var event = {
            type:type,
            ag:{
                x:e.accelerationIncludingGravity.x,
                y:e.accelerationIncludingGravity.y,
                z:e.accelerationIncludingGravity.z,
            },
            e:e
        }

        if(this.listeners[type]) {
            var list = this.listeners[type];
            for(var i in list) {
                var l = list[i];
                l.fn(event);
            }
        }
    }
    
	this.processEvent = function(type,domCanvas,e) {
	    e.preventDefault();
        var point = calcLocalXY(domCanvas,e);
        EventManager.get().processPointerEvent(type,point);
	}
	
    this.processAnims = function() {
        for(var i in this.anims) {
            this.anims[i].update();
        }
    }
        
    this.redraw = function() {
        var ctx = this.domCanvas.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.font = "15px sans-serif";
        ctx.fillRect(0,0,this.domCanvas.width,500);
        for(var n in this.nodes) {
            this.draw(ctx,this.nodes[n]);
        }
    }
    
    this.draw = function(ctx, root) {
        if(!root.getvisible()) return;
        ctx.save();
        ctx.translate(root.gettx(),root.getty());
        root.draw(ctx);
        if(root instanceof Transform) {
            ctx.scale(root.getscalex(),root.getscaley())
        }
        if(root.isparent && root.isparent()) {
            for(var i=0; i<root.getChildCount(); i++) {
                this.draw(ctx,root.getChild(i));
            }
        }
        ctx.restore();
    }
	
}


window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          window.oRequestAnimationFrame      ||
          window.msRequestAnimationFrame     ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();


function Engine() {
    this.cans = [];
    
    this.start = function() {
        var self = this;
        function doit() {
            for(var i in self.cans) {
                self.cans[i].processAnims();
            }
            for(var i in self.cans) {
                self.cans[i].redraw();
            }
            window.requestAnimFrame(doit);
        }
        doit();
    }
    
    this.createStage = function(id) {
        var can = document.getElementById(id);
        CanvasStage.extend(Stage);
        var cs = new CanvasStage(can);
        cs.nodes = [];
        cs.setup();
        this.cans.push(cs);
        return cs;
    }
    
}



var Corex = {
    start: function(f) {
        var core = new Core();
        core.start = new Engine().start;
        core.createStage = new Engine().createStage;
        core.cans = new Engine().cans;
        f(core);
        core.start();
    }
}

