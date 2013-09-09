var amino = require('../build/desktop/amino.js');
var widgets = require('../build/desktop/widgets.js');
//var amino = require('./amino.js');
amino.startApp(function(core,stage) {
    var group = new amino.ProtoGroup();
//    var group = core.createGroup();
    core.setRoot(group);
    
    
    var cw = 720;
    var ch = 900;
    
    var views = [];
    var current = 1;
    
    function slideNext() {
        current = current+1;
        if(current > views.length-1) current = views.length-1;
        for(var i in views) {
            slide(i,views[i]);
        }
    }
    
    function slidePrev() {
        current = current-1;
        if(current < 0) current = 0;
        for(var i in views) {
            slide(i,views[i]);
        }
    }
    
    function dragHandler(e) {
        views.forEach(function(v) {
            v.setTx(v.getTx()+e.dx);
        });
    }
    function releaseHandler(e) {
        var n = views.indexOf(e.target);
        var xoff = (n-current)*cw*1.2;
        var targetX = cw/4 + xoff/2;
        var actualX = e.target.getTx();
        if(actualX < targetX-cw/3) {
            slideNext();
            return;
        }
        if(actualX > targetX+cw/3) {
            slidePrev();
            return;
        }
        
        for(var i in views) {
            slide(i,views[i]);
        }
    }
    for(var i=0; i<4; i++) {
        var rect = new amino.ProtoRect();
        rect.setW(cw).setH(ch).setTy(200);
        rect.setTx((i-current)*cw);
        rect.setId("rect_"+i);
        views.push(rect);
        group.add(rect);
        core.on("drag",rect,dragHandler);
        core.on("release",rect,releaseHandler);
    }
    views[0].setFill("#ff0000");
    views[1].setFill("#ffff00");
    views[2].setFill("#ff00ff");
    
    
    var prevbutton = new widgets.PushButton().setText("prev").setFontSize(40)
        .setW(200).setH(100).setTx(0).setTy(0).setId("prev");
    var button = new widgets.PushButton().setText("zoom").setFontSize(40)
        .setW(200).setH(100).setTx(230).setTy(0).setId("zoom");
    var nextbutton = new widgets.PushButton().setText("next").setFontSize(40)
        .setW(200).setH(100).setTx(460).setTy(0).setId("next");
        
    var zoomedin = true;
    function zoomit(i,rect) {
        var dur = 300;
        var xoff = (i-current)*cw*1.2;
        if(zoomedin) {
            //zoom out
            var anims = [];
            anims[0] = core.createPropAnim(rect,"scalex",1,0.5, dur, 1, false);
            anims[1] = core.createPropAnim(rect,"scaley",1,0.5, dur, 1, false);
            anims[2] = core.createPropAnim(rect,"tx",0+xoff, cw/4 + xoff/2, dur, 1, false);
            anims[3] = core.createPropAnim(rect,"ty",200,400, dur, 1, false);
            anims.forEach(function(a) {
                a.setInterpolator(amino.Interpolators.CubicInOut);
            });
        } else {
            //zoom in
            var anims = [];
            anims[0] =  core.createPropAnim(rect,"scalex",0.5,1, dur, 1, false);
            anims[1] = core.createPropAnim(rect,"scaley",0.5,1, dur, 1, false);
            anims[2] = core.createPropAnim(rect,"tx",cw/4+xoff/2,0+xoff, dur, 1, false);
            anims[3] = core.createPropAnim(rect,"ty",400,200, dur, 1, false);
            anims.forEach(function(a) {
                a.setInterpolator(amino.Interpolators.CubicInOut);
            });
        }
    }
    function slide(i,rect) {
        var dur = 200;
        var anim;
        if(zoomedin) {
            var xoff = (i-current)*cw;
            anim = core.createPropAnim(rect, "tx", rect.getTx(), xoff, dur, 1, false);
        } else {
            var xoff = (i-current)*cw*1.2;
            anim = core.createPropAnim(rect, "tx", rect.getTx(), cw/4+xoff/2, dur, 1, false);
        }
        anim.setInterpolator(amino.Interpolators.CubicInOut);
    }
    core.on("action",button,function() {
        for(var i in views) {
            zoomit(i,views[i]);
        }
        zoomedin = !zoomedin;
    });
    core.on("action",nextbutton,slideNext);
    core.on("action",prevbutton,slidePrev);
    
    group.add(button);
    group.add(nextbutton);
    group.add(prevbutton);
});
















