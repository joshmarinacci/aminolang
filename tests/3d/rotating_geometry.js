var amino = require('amino.js');
var widgets= require('widgets.js');

amino.startApp(function(core, stage) {

    // set up the stage
    stage.setSize(1280,720);
    var group = new amino.ProtoGroup();
    stage.setRoot(group);



    var poly = new amino.ProtoPoly();
    // util funcs to convert to radians
    var cos = function(th) { return Math.cos(th/180.0*Math.PI); }
    var sin = function(th) { return Math.sin(th/180.0*Math.PI); }


    //make the geometry
    var points = [];
    for(var i=0; i<360*2; i+=2) {
        points.push(cos(i*5)*100);
        points.push(sin(i*7)*100);
        points.push(cos(i)*100);
    }
    poly.setGeometry(points);

    // important! We are using 3 numbers per point
    poly.setDimension(3);

    // center
    poly.setTx(1280/2).setTy(720/2);

    // add to the group
    group.add(poly);
    // spin it forever
    core.createPropAnim(poly,"rotateY",0,360,10000).setCount(-1);

});
