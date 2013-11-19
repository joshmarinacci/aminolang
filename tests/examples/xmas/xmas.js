if(typeof document == "undefined") {
    var amino = require('amino.js');
    var widgets= require('widgets.js'); 
}
amino.startApp(function(core,stage) {
    stage.setSize(1024,740);
    var basepath = "tests/examples/xmas/";
    
    
    var snowball = new amino.ProtoImageView().setSrc(basepath+"snowball.png");
    
    var snow = new amino.ProtoGroup();
    var MAX_WIDTH = 1024;
    var MAX_HEIGHT = 800;
    var MAX_PARTICLES = 100;
    var count = 0;
    var PARTICLE_INCREMENT = 10;
    
    function updateParticles() {
        if(snow.children.length < MAX_PARTICLES && count % 50 == 0) {
            for(var j=0;j<PARTICLE_INCREMENT;j++) {
                var r = new amino.ProtoImageView();
                r.image = snowball.image;
                amino.native.updateProperty(r.handle,"texid",r.image.texid);
//            l.image = base_letter.image;
//            amino.native.updateProperty(l.handle,"texid",l.image.texid);
                r.setTx(Math.random()*MAX_WIDTH);
                r.setTy(-100);
                r.vx = (0.5-Math.random())/1.0;
                r.vy = (0.5+Math.random())/1.0;
                snow.add(r);
            }
        }
        
        count++;
        for(var i=0;i<snow.children.length;i++) {
            var r = snow.children[i];
            var x = r.getTx()+r.vx;
            var y = r.getTy()+r.vy;
            if(x > MAX_WIDTH) x = 0;
            if(x < 0) x = MAX_WIDTH;
            if(y > MAX_HEIGHT+100) y = -100;
            r.setTx(x);
            r.setTy(y);
        }
    }
    
    snow.dirty = true;
    amino.dirtylist.push(snow);
    
    snow.validate = function() {
        updateParticles();
        setTimeout(function() { 
            snow.dirty = true;
            amino.dirtylist.push(snow);
        },0);
    }

    
    

    var daysleft = new amino.ProtoGroup()
        .add(new amino.ProtoText()
            .setText('79')
            .setTx(533)
            .setTy(483)
            .setFontSize('40')
            .setFill("#994400")
            )
        .setTx(-350.0).setTy(53.0);
    var sceneRoot = new amino.ProtoGroup()
        .add(new amino.ProtoImageView().setSrc(basepath+"bg.png").setTx(50))
        .add(daysleft);
    

    var offsets = [ 10, 110, 180, 273, 351, 490, 565,  665, 768, 863, 970];
    var widths =  [100,  70, 100,  82, 102,  85, 103,  100, 100, 100,  35];

    var base_letter = new amino.ProtoImageView().setSrc(basepath+"letters.png");
    console.log(base_letter.image);
    
    function genLetters(group, letters) {
        //base image width = 1018
        var IW = 1018;
        var x = 0;
        for(var i=0; i<letters.length; i++) {
            var ch = letters.charCodeAt(i);
            if(ch == 46) ch = 48+10;
            ch = ch-48;
            var off = offsets[ch];
            var iw = widths[ch];
            var l = new amino.ProtoImageView()
                .setTextureLeft(off/IW)
                .setTextureRight((off+iw)/IW)
                .setW(iw)
                .setH(295)
                .setTx(x).setTy(0);
            l.image = base_letter.image;
            amino.native.updateProperty(l.handle,"texid",l.image.texid);
            group.add(l);
            x += iw;
        }
    }
    var letters = new amino.ProtoGroup();
    letters.setTx(155).setTy(320);
    genLetters(letters,'36.39');
    
    
    setInterval(function() {
        var today = new Date();
        var xmas = new Date("December 25, 2013");
        var diff = xmas.getTime() - today.getTime();
        var days = diff / (1000 * 60 * 60 * 24);
        daysleft.children[0].setText("");
        letters.clear();
        genLetters(letters,''+days.toFixed(5));
    },1000);
    
    
    stage.setRoot(new amino.ProtoGroup()
        .add(sceneRoot)
        .add(letters)
        .add(snow)
        );
});
