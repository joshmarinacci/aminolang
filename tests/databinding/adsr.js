var amino = require('amino.js');
var mirrorAmino = require('./superprops.js').mirrorAmino;
var ou = require('./superprops-util.js');
var Group = require('./superprops.js').Group;
var Rect = require('./superprops.js').Rect;
var Text = require('./superprops.js').Text;

function Adsr() {
    ou.makeProps(this, {
        a:100,
        d:200,
        s:50,
        r:300
    });
    return this;
};


function Polygon() {
    ou.makeProps(this, {
        id:'polygon',
        visible:true,
        x:0,
        y:0,
        sx:1,
        sy:1,
        closed:true,
        filled:true,
        fill:'#ff0000',
        opacity:1.0,
        dimension:2,
        geometry:[0,0, 50,0, 0,0],
    });
    this.handle = amino.native.createPoly();
    mirrorAmino(this,{
        x:'tx',
        y:'ty',
        visible:'visible',
        sx:'scalex',
        sy:'scaley',
        fill:'fill',
        id:'id',
        geometry:'geometry',
    });
    this.contains = function() { return false };
    return this;
}


amino.startApp(function(core, stage) {
    var gg = new Group();
    var adsr = new Adsr();
    var g = new Group();
    gg.add(g);
    stage.setRoot(gg);

    function minus(coeff) {
        return function(val) {
            return val-coeff;
        }
    };

    var A = new Rect().fill("#ff0000").w(20).h(20).y(50-10);
    A.x.bindto(adsr.a,minus(10));

    core.on('press', A, function(e) {
        adsr.a(e.target.x());
    })
    core.on('drag', A, function(e) {
        adsr.a(adsr.a()+e.dx);
    });

    var D = new Rect().fill("#ff0000").w(20).h(20).y(50).x(100);
    D.x.bindto(adsr.d,minus(10));
    D.y.bindto(adsr.s,minus(10));

    core.on('press', D, function(e) {
        adsr.d(e.target.getTx());
        adsr.s(e.target.getTy());
    })
    core.on('drag', D, function(e) {
        adsr.d(adsr.d()+e.dx);
        adsr.s(adsr.s()+e.dy);
    });


    var R = new Rect().fill("#ff0000").w(20).h(20).y(50).x(200);
    R.y.bindto(adsr.s,minus(10));
    R.x.bindto(adsr.r,minus(10));

    core.on('press', R, function(e) {
        adsr.s(e.target.getTy());
        adsr.r(e.target.getTx());
    });
    core.on('drag', R, function(e) {
        adsr.s(adsr.s()+e.dy);
        adsr.r(adsr.r()+e.dx);
    })

    var poly = new Polygon().x(0).y(0);
    poly.geometry([0,100, 50,50, 0,100]);
    g.add(poly);


    function updatePoly() {
        poly.geometry([0,200,
            adsr.a(),50,
            adsr.d(),adsr.s(),
            adsr.r(),adsr.s(),
            300,200])
    }

    adsr.a.watch(updatePoly);
    adsr.d.watch(updatePoly);
    adsr.s.watch(updatePoly);
    adsr.r.watch(updatePoly);

    g.add(A,D,R);


    function StringFormat(str) {
        return function(v) {
            return str.replace("%",v);
        }
    }

    var format = StringFormat;

    var label1 = new Text().y(40*1);
    label1.text.bindto(adsr.a, format("A: %"));

    var label2 = new Text().y(40*2);
    label2.text.bindto(adsr.d, format("D: %"));

    var label3 = new Text().y(40*3);
    label3.text.bindto(adsr.s, format("S: %"));

    var label4 = new Text().y(40*4);
    label4.text.bindto(adsr.r, format("% => R"));
    gg.add(label1,label2,label3,label4);


    gg.find('Text').x(10).fill("#ffffff");

    g.x(100).y(130);

    adsr.a(50).d(100).s(100).r(250);
});
