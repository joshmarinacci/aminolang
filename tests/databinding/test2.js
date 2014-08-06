var p1 = {
    first: "Jimmy",
    last: "Fallon",
}
var p2 = {
    first:"Jimmy",
    _last: "Walker",
    _get_last: function() {
        return this._last;
    },
    get last() {
        return this._get_last();
    },
    bind: function(target_prop) {
        var self = this;
        return {
            to: function(source, source_prop) {
                console.log("bind ", p1,'.',source_prop, '=>', target_prop);
                self['_get_'+target_prop] = function() { return source[source_prop]; }
            }
        }
    }
}




//bindTo(p1,'last',p2,'last');
console.log(p2.last);
p1.last = 'Carter';
console.log(p2.last);

p2.bind('last').to(p1,'last');
console.log(p2.last);
