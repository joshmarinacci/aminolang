var cp = require('child_process');

var child = cp.fork(__dirname+'/test1_child.js');
child.on('message', function(m) {
    console.log("parent got",m);
});


var event = {
    id:'blah',
    type:'mouse',
    x:100,
    y:100,
}

child.send(event);
