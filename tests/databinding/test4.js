var amino = require('amino.js');

function defProp(obj, name, src) {
    obj['_'+name] = src[name];
    obj['_get_'+name] = function() { return this['_'+name]; };
    Object.defineProperty(obj, name, {
        get: function() {
            return this['_get_'+name]();
        },
        set: function(val) {
            this['_'+name] = val;
        },
    });
}

function make(src) {
    var obj = {};
    for(var name in src) {
        defProp(obj, name, src);
    }

    obj.bind = function(target_prop) {
        var self = this;
        return {
            to: function(source, source_prop, tran) {
                var fn = function() { return source[source_prop]; };
                if(tran) {
                    self['_get_'+target_prop] = function() { return tran(fn()); }
                } else {
                    self['_get_'+target_prop] = fn;
                }
            }
        }
    };
    return obj;
}

function makeProp(obj,name,val) {
    obj[name] = function(v) {
        if(v != undefined) {
            return obj[name].set(v);
        } else {
            return obj[name].get();
        }
    }
    obj[name].listeners = [];
    obj[name].value = val;
    obj[name].set = function(v) {
        this.value = v;
        for(var i=0; i<this.listeners.length; i++) {
            this.listeners[i](this.value,this);
        }
        return obj;
    }
    obj[name].get = function(v) {
        return this.value;
    }
    obj[name].match = function(prop) {
        var set = this;
        prop.listeners.push(function(v) {
            set(v);
        });
    }
}

function rect() {
    makeProp(this,'x',0);
    makeProp(this,'y',0);
    makeProp(this,'w',50);
    makeProp(this,'h',50);
    makeProp(this,'fill','#ffffff');
}

var r1 = new rect();
r1.x(50).y(50);

console.log("rect.x",r1.x);
for(var name in rect.x) {
    console.log('   ',name,'=',r1.x[name]);
}
console.log("set to 50,        rect.x",r1.x());
console.log("set to 50,        rect.y",r1.y());

function adsr() {
    var self = this;
    makeProp(this,'a',0);
    makeProp(this,'d',0);
    makeProp(this,'s',0);
    makeProp(this,'r',0);
}

var adsr = new adsr();
adsr.a(10);
console.log("set to 10,        adsr.a",adsr.a());
adsr.a(20);
console.log("set to 20,        adsr.a",adsr.a());
r1.y.match(adsr.a);
adsr.a(30);
console.log("set to 30,        adsr.a",adsr.a());
console.log("matched to 30,    rect.y",r1.y());



function mirror(sobj,tobj,props) {
    function mirrorProp(sobj,sname,tobj,tname) {
        sobj[sname].listeners.push(function(v) {
            tobj[tname](v);
        });
    }
    for(var name in props) {
        mirrorProp(sobj,name,tobj,props[name]);
    }
}


amino.startApp(function(core, stage) {
    var g = new amino.ProtoGroup();
    var r1 = new amino.ProtoRect().setFill("#ff0000").setW(100).setH(100).setTx(100).setTy(50);
    g.add(r1);
    stage.setRoot(g);


    var r2 = new rect();
    mirror(r2,r1, {
        x:'setTx',
        y:'setTy',
        w:'setW',
        h:'setH',
        fill:'setFill',
    });
    r2.x(100).y(100).w(100).h(50).fill('#ff00ff'); //purple rect
    r2.x.match(adsr.a);

    core.on('press', r1, function(e) {
        adsr.a(e.target.getTx(),e.x);
    })
    core.on('drag', r1, function(e) {
        adsr.a(adsr.a()+e.dx);
    });

});
