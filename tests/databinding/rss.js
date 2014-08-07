var amino = require('amino.js');
var ou = require('./superprops-util.js');
var Group = require('./superprops.js').Group;
var Rect = require('./superprops.js').Rect;
var Text = require('./superprops.js').Text;
var Button = require('./superprops.js').Button;

amino.startApp(function(core, stage) {

    //simple RSS viewer

    var g = new Group().id('g1');
    var titles = ['foo','bar','baz'];// async init for the list of headlines
    var text = new Text().fill("#ff00ff").text('no text').y(100).x(100);
    g.add(text);
    var count = -1;
    function flipOut() {
        g.ry.anim().from(0).to(180).dur(1000).delay(1000).then(flipIn).start();
    }
    function flipIn() {
        count = (count+1)%titles.length;
        text.text(titles[count]);
        g.ry.anim().from(180).to(360).dur(1000).delay(0).then(flipOut).start();
    }
    flipOut();
    stage.setRoot(g);

/*

    text.rx.anim().from(0).to(90).dur(1000)
    .then(function() {
        count = (count+1)%titles.length;
        this.text(titles[count]);
    })
    .thenAnim().from(90).to(0).dur(1000)
    .thenWait(5000)
    .repeat(-1);
    */

    /*
    //particles for galaxy
    var parts = [];
    fornums(0,1000).map(function(i) {
        return {
            radius: rand(0.0,0.9),
            angle:  rand(0,Math.PI*2),
            color:  Color.hue(rand(0,100)).toRGBString(),
            size:   rand(2,20),
        }
    });
    var sim = new ParticleSimulator(parts);
    sim.draw = function(gl) {
        //map the values to GL stuff
    }



    //photo slideshow
    var files = []; //scan dir for files
    var count = 0;
    var views = [];
    setInterval(function() {
        //cycle the views
        views.push(views.shift());

        //anim the first two views
        views[0].x.anim().from(0).to(-SCREEN_WIDTH).dur(1000);
        views[1].x.anim().from(SCREEN_WIDTH).to(0).dur(1000);
        //load the third view
        views[2].src(files[count]).on('load',function() {
            var scale = Math.min(SW/img3.w(), SH/img3.h());
            views[2].sx(scale).sy(scale);
        });
        count = (count+1)%files.length;
    },5000);



    //big countdown timer
    letter[0]
    */

});
