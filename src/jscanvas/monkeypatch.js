var old_propAnim = PropAnim;
PropAnim = function() {
    this.markDirty = function() {
    }
}
PropAnim.extend(old_propAnim);

var old_group = Group;
Group = function() {
    this.nodes = [];
    this.isparent = function() { return true; }
    this.add = function(child) {
        if(child == null) {
            console.log("ERROR. tried to add a null child to a group");
            return;
        }
        this.getNodes().push(child);
        child.setParent(this);
        this.markDirty();
    }
    this.draw = function(ctx) {
    }
    this.clear = function() {
        this.nodes = [];
    }
    this.getChildCount = function() {
        return this.nodes.length;
    }
    this.getChild = function(i) {
        return this.nodes[i];
    }
    
}
Group.extend(old_group);

var old_transform = Transform;
Transform = function() {
    this.isparent = function() { return true; }
    this.getChildCount = function() {
        return 1;
    }
    this.getChild = function(i) {
        return this.child;
    }
    this.toInnerCoords = function(pt) {
        //console.log("turning ", pt2);
        var pt2 = new Point(
            pt.x-this.getTx(),
            pt.y-this.getTy()
            );
        //console.log("to ",pt2);
        pt2 = new Point( pt2.x/this.getScalex(), pt2.y/this.getScaley());
        //console.log("to ", pt2);
        var theta = this.getRotate()/180*Math.PI;
        //console.log("cos of theta = " + node.getRotate() + " " + theta + " " + Math.cos(theta));
        pt2 = new Point(
            (Math.cos(theta)*pt2.x + Math.sin(theta)*pt2.y),
            (-Math.sin(theta)*pt2.x + Math.cos(theta)*pt2.y)
            );
        return pt2;
        //console.log("to ", pt2);
//            console.log("theta = " + (Math.cos(theta)*pt2.x + Math.sin(theta)*pt2.y));
//            console.log("theta = " + (Math.sin(theta)*pt2.x - Math.cos(theta)*pt2.y));
    }
}
Transform.extend(old_transform);

var old_rect = Rect;
Rect = function() {
    this.fill = "blue";
    this.draw = function(ctx) {
        if(this.getOpacity() < 1) {
            ctx.save();
            ctx.globalAlpha = this.getOpacity();
        }        
        ctx.fillStyle = this.fill;
        ctx.fillRect(this.x,this.y,this.w,this.h);
        ctx.fillStyle = "black";
        ctx.strokeRect(this.x,this.y,this.w,this.h);
        if(this.getOpacity() < 1) {
            ctx.restore();
        }
    }
    this.getBounds = function() {
        var b = new Bounds(
            this.gettx()+this.getx(),
            this.getty()+this.gety(),
            this.getw(),this.geth());
        b.x = this.gettx()+this.getx();
        b.y = this.getty()+this.gety();
        b.w = this.getw();
        b.h = this.geth();
        return b;
    }
    return this;
}
Rect.extend(old_rect);

var old_circle = Circle;
Circle = function() {
    this.fill = "green";
    this.contains = function(pt) {
        if(pt.x >= this.cx-this.radius && pt.x <= this.cx + this.radius) {
            if(pt.y >= this.cy-this.radius && pt.y<=this.cy + this.radius) {
                return true;
            }
        }
        return false;
    }
    ///REMOVE
    this.draw = function(ctx) {
        ctx.fillStyle = this.fill;
        ctx.beginPath();
        ctx.arc(this.cx, this.cy, this.radius, 0, Math.PI*2, true); 
        ctx.closePath();
        ctx.fill();
    }
}
Circle.extend(old_circle);
    
    
var old_bounds = Bounds;
Bounds = function() {
    this.markDirty = function() {
    }
    return this;
}
Bounds.extend(old_bounds);


var old_image = ImageView;
ImageView = function() {
    this.seturl = function(url) {
        this.url = url;
        
        this.img = new Image();
        this.loaded = false;
        var self = this;
        this.img.onload = function() {
            self.loaded = true;
            self.markDirty();
            console.log("loaded: " + self.url);
        }
        this.img.src = this.url;
        this.markDirty();
    }
    this.draw = function(ctx) {
        ctx.fillStyle = "red";
        ctx.fillRect(this.x,this.y,this.w,this.h);
        if(this.loaded) {
            var s1 = this.w/this.img.width;
            var s2 = this.h/this.img.height;
            var scale = Math.min(s1,s2);
            if(this.autoscale) {
                scale = Math.max(s1,s2);
            }
            ctx.drawImage(this.img,this.x,this.y,scale*this.img.width,scale*this.img.height);
        }
        ctx.fillStyle = "black";
        ctx.strokeRect(this.x,this.y,this.w,this.h);
    }
}
ImageView.extend(old_image);


var old_pushbutton = PushButton;
PushButton = function() {
    this.draw = function(g) {
        g.fillStyle = this.getBaseColor();
        g.fillRect(this.getX(),this.getY(),this.getW(),this.getH());
        g.fillStyle = "black";
        g.fillText(this.getText(),this.getX()+5,this.getY()+15);
    };
    var self = this;
    EventManager.get().on(Events.Press, this, function(e) {
        self.setBaseColor("lightBlue");
    });
    
    EventManager.get().on(Events.Release, this, function(e) {
        self.setBaseColor("gray");
    });
    this.setBaseColor("gray");
}
PushButton.extend(old_pushbutton);


var old_togglebutton = ToggleButton;
ToggleButton = function() {
    this.draw = function(g) {
        g.fillStyle = this.getBaseColor();
        if(this.getSelected()) {
            g.fillStyle = "green";
        }
        g.fillRect(this.getX(),this.getY(),this.getW(),this.getH());
        g.fillStyle = "black";
        g.fillText(this.getText(),this.getX()+5,this.getY()+15);
    };
    var self = this;
    EventManager.get().on(Events.Press, this, function(e) {
        self.setBaseColor("lightBlue");
    });
    EventManager.get().on(Events.Release, this, function(e) {
        self.setBaseColor("gray");
        self.setSelected(!self.getSelected());
    });
    this.setBaseColor("gray");
}
ToggleButton.extend(old_togglebutton);


var old_slider = Slider;
Slider = function() {
    this.valueToPoint = function(v) {
        return (this.value-this.minvalue) *
            (this.w / (this.maxvalue-this.minvalue));
    }
    this.pointToValue = function(p) {
        return p * (this.maxvalue-this.minvalue)/this.w + this.minvalue;
    }
    this.draw = function(g) {
        g.fillStyle = "gray";
        g.fillRect(this.getX(),this.getY(),this.getW(),this.getH());
        g.fillStyle = "black";
        var v = this.valueToPoint(this.value);
        g.fillRect(this.getX(),this.getY(),v,this.getH());
    }
    EventManager.get().on(Events.Drag, this, function(e) {
        var r = e.target;
        r.setValue(r.pointToValue(e.point.x-r.getX()));
    });
}
Slider.extend(old_slider);

var old_spinner = Spinner;
Spinner = function() {
    this.anim = new PropAnim(this,"rotation",0,90,500);//.setLoop(-1);
    this.setactive = function(active) {
        this.active = active;
        this.markDirty();
        if(this.active) {
            //this.anim.start(); 
        } else {
            if(this.anim.playing) {
                //this.anim.stop();
            }
        }
        return this;
    }
    this.rotation = 0;
    
    this.setRotation = function(rotation) {
        this.rotation = rotation;
        this.markDirty();
        return this;
    }
    this.draw = function(ctx) {
        if(!this.getactive()) return;

        ctx.fillStyle = "#ccc";
        ctx.save();
        ctx.translate(this.x+this.w/2,this.y+this.h/2);
        ctx.rotate(this.rotation/3.14*180);
        var z = this.w/2;
        ctx.strokeRect(-z,-z,z*2,z*2);
        ctx.restore();
        
        ctx.save();
        ctx.translate(this.x+this.w/2,this.y+this.h/2);
        ctx.rotate(-this.rotation/3.14*180);
        var z = this.w*3/8;
        ctx.strokeRect(-z,-z,z*2,z*2);
        ctx.restore();
    };
    return this;
}
Spinner.extend(old_spinner);

var old_label = Label;
Label = function() {
    this.draw = function(g) {
        g.fillStyle = "black";
        g.fillText(this.getText(),this.getX()+5,this.getY()+15);
    };
    return this;
}
Label.extend(old_label);


var old_textbox = Textbox;
Textbox = function() {
    this.draw = function(g) {
        g.fillStyle = "gray";
        g.fillRect(this.getX(),this.getY(),this.getW(),this.getH());
        
        
        g.fillStyle = "black";
        g.fillText(this.getText(),this.getX()+5,this.getY()+15);
        
        g.lineWidth = 2;
        g.strokeStyle = "black";
        g.strokeRect(this.getX(),this.getY(),this.getW(),this.getH());
    };
    return this;
}
Textbox.extend(old_textbox);

var old_anchorpanel = AnchorPanel;
AnchorPanel = function() {
    this.nodes = [];
    this.isparent = function() { return true; }
    this.fill = "lightGray";
    this.setFill = function(fill) {
        this.fill = fill;
        return this;
    };
    this.getFill = function() {
        return this.fill;
    };
    this.draw = function(g) {
        g.fillStyle = this.fill;
        g.fillRect(this.getX(),this.getY(),this.getW(),this.getH());
        g.lineWidth = 2;
        g.strokeStyle = "black";
        g.strokeRect(this.getX(),this.getY(),this.getW(),this.getH());
    };
    this.add = function(a) {
        this.nodes.push(a);
        return this;
    }
    this.getChildCount = function() {
        return this.nodes.length;
    }
    this.getChild = function(i) {
        return this.nodes[i];
    }
    return this;
}
AnchorPanel.extend(old_anchorpanel);

var old_ListView = ListView;
ListView = function() {
    this.cb = [];
	this.listModel = ['a','b','c'];
    
    this.index = 0;
    this.setselectedIndex = function(index) {
        var i = index;
        if(this.listModel.items) {
            if(i > this.listModel.items.length-1) {
                i = this.listModel.items.length-1;
            }
        }
        this.index = i;
        this.fireChange();
        return this;
    }
    this.getselectedObject = function() {
        return this.listModel.get(this.index);
    }
    this.setselectedObject = function() {
        return this;
    }
    this.fireChange = function() {
        for(var i=0; i<this.cb.length; i++) {
            this.cb[i](this);
        }
        this.markDirty();
    }
        
    this.rh = 19;
    
	this.listen = function(cb) {
	    this.cb.push(cb);
        return this;
    }

    this.scroll = 0;
    this.draw = function(ctx) {
        ctx.font = "15px sans-serif";
        //background
        ctx.fillStyle = "#eee";
        ctx.fillRect(this.x,this.y,this.w,this.h);
        
        //selected row background
        ctx.fillStyle = "lightBlue";
        ctx.fillRect(this.x,this.y+this.index*this.rh, this.w, this.rh);
        
        ctx.fillStyle = "black";
        ctx.save();
        ctx.beginPath();
        ctx.rect(this.x,this.y,this.w,this.h);
        ctx.clip();
        for(var i=0; i<this.listModel.length; i++) {
            var y = i*this.rh;
            if(y < this.scroll-this.rh) continue;
            if(y > this.getH()+this.scroll) break;
            ctx.fillText(this.listModel[i],
                this.x+5,this.y+y+15-this.scroll);
        }
        ctx.restore();
        if(this.listModel.items) {
            for(var i=0; i<this.listModel.items.length; i++) {
                var y = i*this.rh;
                if(y > this.getH()) break;
                ctx.fillText(this.listModel.items[i],
                    this.x+5,this.y+y+15);
            }
        }
        
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x,this.y,this.w,this.h);
    }
	var self = this;
	EventManager.get().on(Events.Press, this, function(e) {
            var y = e.point.y - self.y - self.ty;
            var n = parseInt(y / self.rh,10);
            self.setselectedIndex(n);
	});
	EventManager.get().on(Events.Drag, this, function(e) {
//            console.log("drag on listview at : ",e.delta);
            self.scroll -= e.delta.y;
            if(self.scroll < 0) self.scroll = 0;
            var maxH = self.rh * self.listModel.length;
            if(self.scroll + self.getH() > maxH) {
                self.scroll = maxH-self.getH();
            }
	});
    return this;
}
ListView.extend(old_ListView);


var old_FlickrQuery = FlickrQuery
FlickrQuery = function() {
    this.setactive = function() {
        return this;
    }
    this.setexecute = function() {
        return this;
    }
    this.setw = function() { return this; }
    this.seth = function() { return this; }
    this.settx = function() { return this; }
    this.setty = function() { return this; }
    this.setquery = function() { return this; }
    this.setresults = function() { return this; }
    this.getvisible = function() { return false; }
    return this;
}
FlickrQuery.extend(old_FlickrQuery);

// FlickrQuery
// Spinner
// ListView
// Label.fontsize
// AnchorPanel must be a parent
function camelize(s) {
    return s.substring(0,1).toUpperCase() + s.substring(1);
}
function a(node, prop, start, finish, dur) {
    return {
        node:node,
        prop:prop,
        sval:start,
        fval:finish,
        dur:dur,
        running:false,
        finished:false,
        easefn:null,
        setVal:function(t) {
            if(this.easefn != null) {
                t = this.easefn(t);
            }
            var v = (this.fval-this.sval)*t + this.sval;
            //console.log("t = " + t + " " + v);
            node["set"+camelize(this.prop)](v);
        },
        update:function() {
            if(this.finished) return;
            if(!this.running) {
                this.startTime = new Date().getTime();
                this.running = true;
                return;
            }
            var time = new Date().getTime();
            var dt = time-this.startTime;
            var t = dt/this.dur;
            if(t > 1) {
                this.finished = true;
                this.setVal(1);
                return;
            }
            this.setVal(t);
        },
        setEase:function(easefn) {
            this.easefn = easefn;
            return this;
        }
    };
}

function Transition() {
    var self = this;
    this.pushTarget = null;
    this.pushTrigger = null;
    this.stage = null;
    this.push = function() {
        self.stage.addAnim(a(self.pushTarget,"tx",320,0,300));
    }
    this.pop = function() {
        self.stage.addAnim(a(this.pushTarget,"tx",0,320,300));
    }
    this.install = function(stage) {
        console.log("installing transition");
        self.stage = stage;
        this.pushTarget.setTx(320);
        stage.on(Events.Press, this.pushTrigger, function(e) {
            self.push();
        });
    }
}


var SceneParser = function() {
    this.parseChildren = function(val, obj) {
        for(var i=0; i<obj.children.length; i++) {
            var ch = obj.children[i];
            var chv = this.parse(ch);
            val.add(chv);
        }
    }
    
    this.fillProps = function(out, obj) {
        for(var prop in obj) {
            if(prop == "type") continue;
            if(prop == "children") continue;
            out[prop] = obj[prop];
        }
    }
    
    this.findNode = function(id, node) {
        if(node.id && node.id == id) return node;
        if(node.isparent && node.isparent()) {
            for(var i=0; i<node.getChildCount(); i++) {
                var ret = this.findNode(id,node.getChild(i));
                if(ret != null) return ret;
            }
        }
        return null;
    }
    
    this.parseBindings = function(val, obj) {
        console.log("parsing bindings " + obj.bindings.length);
        val.bindings = [];
        for(var i=0; i<obj.bindings.length; i++) {
            var bin = obj.bindings[i];
            var trans = new Transition();
            trans.id = bin.id;
            trans.pushTrigger = this.findNode(bin.pushTrigger,val);
            trans.pushTarget = this.findNode(bin.pushTarget,val);
            val.bindings.push(trans);
        }
    }

    this.typeMap = {
        "Group":Group,
        "Rect":Rect,
        "PushButton":PushButton,
        "ToggleButton":ToggleButton,
        "Label":Label,
        "Slider":Slider,
        "ListView":ListView,
        "Document":Group,
        "DynamicGroup":Group,
        "AnchorPanel":AnchorPanel,
    };
    this.parentTypeMap = {
        "Group":Group,
        "Document":Group,
        "DynamicGroup":Group,
        "AnchorPanel":AnchorPanel,
    };
    
    this.parse = function(obj) {
        if(this.typeMap[obj.type]) {
            var out = new this.typeMap[obj.type]();
            if(this.parentTypeMap[obj.type]) {
                this.fillProps(out,obj);
                this.parseChildren(out,obj);
            } else {
                this.fillProps(out,obj);
            }
            
            if(obj.type == "Document" && obj.bindings) {
                this.parseBindings(out,obj);
            }
            
            return out;
        }
        console.log("warning. no object parsed here!");
    }
}
    


