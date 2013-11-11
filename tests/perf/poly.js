if(typeof document == "undefined") {
    var amino = require('amino.js');
    var widgets= require('widgets.js'); 
}

amino.startApp(function(core, stage) {
    var poly = new amino.ProtoPoly();
    //this assigns multiple triangles, not points.
    
    
    var cos = function(th) {
        return Math.cos(th/180.0*Math.PI);
    }
    var sin = function(th) {
        return Math.sin(th/180.0*Math.PI);
    }
    
    var points = [];
    for(var i=0; i<360*2; i+=2) {
        points.push(cos(i*5)*100);
        points.push(sin(i*7)*100);
        points.push(cos(i)*100);
    }
    console.log("points = " + points.length);
    poly.setGeometry(points);
    poly.setDimension(3);
    poly.setTx(200).setTy(200);
    
    var g = new amino.ProtoGroup();
    g.add(poly);
    core.createPropAnim(poly,"rotateY",0,360,10000)
    .setCount(-1);
    
    stage.setRoot(g);
});
