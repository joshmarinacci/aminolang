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





var adsr = make({
    a:20,
    d:0,
    s:0,
    r:0,
});

var ball = make({
    x:0,
    y:0,
});

var mouse = make({
    x:0,
    y:0,
});

ball.bind('x').to(mouse,'x');
adsr.bind('a').to(ball,'x',function(v) { return v*2+ 33; });

console.log('before = ',adsr.a);
mouse.x = 50;
console.log('after = ',adsr.a);
mouse.x = 100;
console.log('after = ',adsr.a);
