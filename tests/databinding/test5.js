var amino = require('amino.js');
var ou = require('./superprops-util.js');
var Group = require('./superprops.js').Group;
var Rect = require('./superprops.js').Rect;
var Text = require('./superprops.js').Text;
var Button = require('./superprops.js').Button;

function Adsr() {
    ou.makeProps(this, {
        a:0,
        d:0,
        s:0,
        r:0
    });
    return this;
};


amino.startApp(function(core, stage) {
    var g = new Group().id('g1');
    stage.setRoot(g);

    var r2 = new Rect().x(100).y(100).w(100).h(50).fill('#ff00ff').id('r2'); //purple rect
    g.add(r2);

    var adsr = new Adsr();
    r2.x.match(adsr.a);

    core.on('press', r2, function(e) {
        adsr.a(e.target.getTx());
    })
    core.on('drag', r2, function(e) {
        adsr.a(adsr.a()+e.dx);
    });

    var r3 = new Rect().x(100).y(300).w(50).h(50).fill("#00ff00").id('r3');
    g.add(r3);
    r3.x.anim().from(0).to(300).dur(3000).loop(5).then(function() {
        console.log("we are finished");
    }).start();

    g.add(new Text().fill("#ffffff").id("textid").text('some text').y(100));

    g.add(new Button().w(200).h(100).visible(true));
    /*
    //how could we add validators and formatters?

    //build a simple layout using binding?
    var gray = '#cccccc';
    var box = new Panel().w(300).h(300).fill(gray);
    var button = new Button().text('lower right');
    button.x.match(box.w).minus(button.w);
    button.y.match(box.h).minus(button.h);

    //CSS style selection
    root.select('rect').fill('#000000');
    root.select('.awesome').stroke('#ffdd44');
    root.select('#title').text('the title');
    */


    /*
    //simple RSS viewer
    var titles = [];// async init for the list of headlines.
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
