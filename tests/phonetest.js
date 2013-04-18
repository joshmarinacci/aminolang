var fs = require('fs');
var amino = require('/data/node/amino.js');
var core = amino.getCore();
var stage = core.createStage();

//load up the scene file
var filedata = fs.readFileSync('phone.json');
var jsonfile = JSON.parse(filedata);
var root = new amino.SceneParser().parse(core,jsonfile);
stage.setRoot(root);

    function elasticIn(t) {
        var p = 0.3;
        return -(Math.pow(2,10*(t-1)) * Math.sin(((t-1)-p/4)*(2*Math.PI)/p));
    }
    function elasticOut(t) {
        var p = 0.3;
        return Math.pow(2,-10*t) * Math.sin((t-p/4)*(2*Math.PI)/p) + 1;
    }
    function cubicIn(t) {
        return Math.pow(t,3);
    }
    function cubicOut(t) {
        return 1-cubicIn(1-t);
    }
    function smoothstepIn(t) {
        return t*t*(3-2*t);
    }
    function cubicInOut(t) {
        if(t < 0.5) return cubicIn(t*2.0)/2.0;
        return 1-cubicIn((1-t)*2)/2;                
    }
    function camelize(s) {
        return s.substring(0,1).toUpperCase() + s.substring(1);
    }
    function a(node, prop, start, finish, dur) {
        return {
            node:node,
            prop:prop,
            sval:start,
            fval:finish,
            dur:dur,
            running:false,
            finished:false,
            easefn:null,
            setVal:function(t) {
                if(this.easefn != null) {
                    t = this.easefn(t);
                }
                var v = (this.fval-this.sval)*t + this.sval;
                //console.log("t = " + t + " " + v);
                node["set"+camelize(this.prop)](v);
            },
            update:function() {
                if(this.finished) return;
                if(!this.running) {
                    this.startTime = new Date().getTime();
                    this.running = true;
                    return;
                }
                var time = new Date().getTime();
                var dt = time-this.startTime;
                var t = dt/this.dur;
                if(t > 1) {
                    this.finished = true;
                    this.setVal(1);
                    return;
                }
                this.setVal(t);
            },
            setEase:function(easefn) {
                this.easefn = easefn;
                return this;
            }
        };
    }

function toTop(id,root) {
    var node = stage.findNode(id,root);
    var par = node.getParent();
    var n = par.nodes.indexOf(node);
    par.nodes.splice(n,1);
    par.add(node);
}
function findTransition(id, root) {
    for(var i=0; i<root.bindings.length; i++) {
        var item = root.bindings[i];
        if(item.id && item.id == id) return item;
    }
    return null;
}


function wrapTransform(target, trans) {
    target.setTx(0);
    target.setTy(0);
    //console.log(target);
    var parent = target.getParent();
    var n = parent.nodes.indexOf(target);
    //console.log("index = " + n);
    parent.nodes.splice(n,1);
    trans.setChild(target);
//        trans.setTy(40);
    parent.add(trans);
    //console.log(parent.nodes);
    return trans;
}
function removeFromParent(target) {
    var parent = target.getParent();
    var n = parent.nodes.indexOf(target);
    parent.nodes.splice(n,1);
}


//set up the apps
var apps = [];
var curr = 0;

apps.push(wrapTransform(stage.findNodeById("app1"),core.createTransform()));
apps.push(wrapTransform(stage.findNodeById("app2"),core.createTransform()));
apps.push(wrapTransform(stage.findNodeById("app3"),core.createTransform()));
apps.push(wrapTransform(stage.findNodeById("app4"),core.createTransform()));
apps.push(wrapTransform(stage.findNodeById("app5"),core.createTransform()));
apps.push(wrapTransform(stage.findNodeById("app6"),core.createTransform()));

for(var i=0; i<apps.length; i++) {
    apps[i].setTx(i*320*2);
    apps[i].setTy(50);
}

//move the topslider to the top of it's siblings
var topSlider = stage.findNodeById("quicksettings");
var par = topSlider.getParent();
removeFromParent(topSlider);
par.add(topSlider);
console.log("top slider = " + topSlider);
topSlider.setTx(0);
topSlider.setTy(-480);

stage.on("PRESS",stage.findNodeById("downButton"), function(e) {
    console.log("down button pressed");
    topSlider.setTx(0);
    topSlider.setTy(0);
    stage.addAnim(a(topSlider,"ty",-200,0,300).setEase(cubicInOut));
});
stage.on("PRESS",stage.findNodeById("quicksettings"),function(e){
    stage.addAnim(a(topSlider,"ty",0,-200,300));
});




//delay 1 sec to ensure the png image is loaded first
setTimeout(function() {
    console.log("starting later\n");
    core.start();
//    setupTextures();
//    setupKeyboard();
},2000);

/*

       {
       "id":"composeTrans"
      ,"type":"Transition"
      ,"kind":"slideInRight"
      ,"pushTrigger":"id456766"
      ,"pushTarget":"composePanel"
      }
      ,{
       "id":"contactsTrans"
      ,"type":"Transition"
      ,"kind":"slideInRight"
      ,"pushTrigger":"id243901"
      ,"pushTarget":"contactsPanel"
      }
*/
