var amino = require('amino.js');

function makeProps(obj,props) {
    for(var name in props) {
        makeProp(obj,name,props[name]);
    }
}
function makeProp(obj,name,val) {
    obj[name] = function(v) {
        if(v != undefined) {
            return obj[name].set(v);
        } else {
            return obj[name].get();
        }
    }
    obj[name].listeners = [];
    obj[name].value = val;
    obj[name].set = function(v) {
        this.value = v;
        for(var i=0; i<this.listeners.length; i++) {
            this.listeners[i](this.value,this);
        }
        return obj;
    }
    obj[name].get = function(v) {
        return this.value;
    }
    obj[name].match = function(prop) {
        var set = this;
        prop.listeners.push(function(v) {
            set(v);
        });
    }
    obj[name].watch = function(fun) {
        obj[name].listeners.push(function(v) {
            fun(v);
        });
    }
}

function mirrorAmino(me,mirrorprops) {
    function camelize(s) {
    	return s.substring(0,1).toUpperCase() + s.substring(1);
    }
    function ParseRGBString(Fill) {
        if(typeof Fill == "string") {
            //strip off any leading #
            if(Fill.substring(0,1) == "#") {
                Fill = Fill.substring(1);
            }
            //pull out the components
            var r = parseInt(Fill.substring(0,2),16);
            var g = parseInt(Fill.substring(2,4),16);
            var b = parseInt(Fill.substring(4,6),16);
            return {
                r:r/255,
                g:g/255,
                b:b/255
            };
        }
        return Fill;
    }

    function mirrorProp(obj,old,native) {
        obj[old].watch(function(newval,oldval){
            if(native == 'fill') {
                var color = ParseRGBString(newval);
                amino.native.updateProperty(obj.handle,'r',color.r);
                amino.native.updateProperty(obj.handle,'g',color.g);
                amino.native.updateProperty(obj.handle,'b',color.b);
                return;
            }

            amino.native.updateProperty(obj.handle, native,newval);
        });
        obj['get'+camelize(native)] = function() {
            return obj[old]();
        }
    }

    for(var name in mirrorprops) {
        mirrorProp(me,name,mirrorprops[name]);
    }
}

function Adsr() {
    makeProps(this, {
        a:0,
        d:0,
        s:0,
        r:0
    });
    return this;
};

function Rect() {
    makeProps(this,{
        x:0,
        y:0,
        w:50,
        h:50,
        visible:true,
        fill:'#ffffff',
        sx:1,
        sy:1,
    })
    makeProp(this,'x',0);
    makeProp(this,'y',0);
    makeProp(this,'w',50);
    makeProp(this,'h',50);
    makeProp(this,'visible',true);
    makeProp(this,'fill','#ffffff');
    makeProp(this,'sx',1);
    makeProp(this,'sy',1);
    this.handle = amino.native.createRect();
    mirrorAmino(this,{
        x:'tx',
        y:'ty',
        w:'w',
        h:'h',
        visible:'visible',
        sx:'scalex',
        sy:'scaley',
        fill:'fill',
    });
    var rect = this;
    this.contains = function(x,y) {
        if(x >= 0 && x <= this.w()) {
            if(y >= 0 && y <= this.h()) {
                return true;
            }
        }
        return false;
    }
}



amino.startApp(function(core, stage) {
    var g = new amino.ProtoGroup();
    stage.setRoot(g);

    var r2 = new Rect().x(100).y(100).w(100).h(50).fill('#ff00ff'); //purple rect
    g.add(r2);

    var adsr = new Adsr();
    r2.x.match(adsr.a);

    core.on('press', r2, function(e) {
        adsr.a(e.target.getTx());
    })
    core.on('drag', r2, function(e) {
        adsr.a(adsr.a()+e.dx);
    });

    var r3 = new Rect().x(100).y(300).w(50).h(50).fill("#00ff00");
    g.add(r3);

    core.createPropAnim(r3, 'tx',0,300, 3000);

    //animation idea
    r3.x.anim().from(100).to(50).dur(5000).repeat(3).lerp('linear').then(function(){
        console.log("we are done here");
    });

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

});
