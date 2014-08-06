var amino = require('amino.js');

function PropAnim(target,name) {
    this._from = null;
    this._to = null;
    this._duration = 1000;
    this._loop = 1;
    if(name == 'x') {
        name = 'tx';
    }
    this._then_fun = null;

    this.from = function(val) {  this._from = val;        return this;  }
    this.to   = function(val) {  this._to = val;          return this;  }
    this.dur  = function(val) {  this._duration = val;    return this;  }
    this.loop = function(val) {  this._loop = val;        return this;  }
    this.then = function(fun) {  this._then_fun = fun;    return this;  }

    this.start = function() {
        this.handle = amino.native.createAnim(
            target.handle,
            name,
            this._from,this._to,this._duration);
        amino.native.updateAnimProperty(this.handle, "count", this._loop);
        amino.getCore().anims.push(this);

        return this;
    }



    this.finish = function() {
        if(this._then_fun != null) {
            this._then_fun();
        }
    }


}


var ou = {
    makeProps: function(obj,props) {
        for(var name in props) {
            this.makeProp(obj,name,props[name]);
        }
    },
    makeProp:function (obj,name,val) {
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
        obj[name].watch = function(fun) {
            obj[name].listeners.push(function(v) {
                fun(v);
            });
        }
        obj[name].anim = function() {
            return new PropAnim(obj,name);
        }
    }
}

exports.makeProps = ou.makeProps;
exports.makeProp = ou.makeProp;
