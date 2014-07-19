var amino = require('amino.js');
var widgets= require('widgets.js');

var data = require('./countries.js');

var w = 1920;
var h = 1080;
var radius = 300;
amino.startApp(function(core, stage) {
//http://mbostock.github.io/protovis/ex/countries.js

    // set up the stage
    stage.setSize(w,h);
    var group = new amino.ProtoGroup();
    stage.setRoot(group);


    var cos = Math.cos;
    var sin = Math.sin;
    var PI = Math.PI;

    function latlon2xyz(lat,lon, rad) {
        var el = lat/180.0*PI;
        var az = lon/180.0*PI;
        var x = rad * cos(el) * sin(az);
        var y = rad * cos(el) * cos(az);
        var z = rad * sin(el);
        return [x,y,z];
    }

    function addCountry(nz) {
        //make the geometry
        for(var i=0; i<nz.borders.length; i++) {
            var border = nz.borders[i];
            var points = [];
            var poly = new amino.ProtoPoly();
            for(var j=0; j<border.length; j++) {
                var point = border[j];
                var pts = latlon2xyz(point.lat,point.lng,radius);
                points.push(pts[0]);
                points.push(pts[1]);
                points.push(pts[2]);
            }
            poly.setFill("#80ff80");
            poly.setGeometry(points);
            poly.setDimension(3);
            group.add(poly);
        }
    }

    for(var i=0; i<data.countries.length; i++) {
        addCountry(data.countries[i]);
    }

    // NOTE: on Raspberry pi we can't just make a line. 
    // A polygon needs at least two segments.
    function addLine(lat,lon,el) {
        var poly = new amino.ProtoPoly();
        var pt1 = latlon2xyz(lat,lon,radius);
        var pt2 = latlon2xyz(lat,lon,radius+el);
        var pt3 = latlon2xyz(lat,lon,radius);
        var points = pt1.concat(pt2).concat(pt3);
        poly.setFill("#ff0000");
        poly.setGeometry(points);
        poly.setDimension(3);
        group.add(poly);
    }

    //add a line at portland
    addLine(45.52, -122.681944, 100);

    // center
    group.setTx(w/2).setTy(h/2);
    //turn earth upright
    group.setRotateX(90);
    group.setRotateY(0);
    group.setRotateZ(0);

    // spin it forever
    core.createPropAnim(group,"rotateZ",0,-360,60*1000).setCount(-1);

});
