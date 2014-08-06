var cp = require('child_process');
var amino = require('amino.js');

function camelize(s) {
	return s.substring(0,1).toUpperCase() + s.substring(1);
}

var classes = {
    'amino.ProtoRect':amino.ProtoRect,
}


amino.startApp(function(core, stage) {
    var g = new amino.ProtoGroup();
    var r1 = new amino.ProtoRect().setFill("#ff0000").setW(100).setH(100).setTx(100).setTy(50);
    g.add(r1);
    stage.setRoot(g);

    var cg1 = generateChild(__dirname+'/test2_child.js');
    g.add(cg1);

    var cg2 = generateChild(__dirname+'/test2_child.js');
    cg2.setTx(300);
    g.add(cg2);


});

function generateChild(path) {
    var g = new amino.ProtoGroup();
    var child = cp.fork(path);
    child.on('message', function(m) {
        console.log("parent got",m);
        if(m.command == 'make') {
            var obj = null;
            obj = new classes[m.target];
            for(var prop in m.props) {
                obj['set'+camelize(prop)](m.props[prop]);
            }
            g.add(obj);
        }

    });
    return g;
}
