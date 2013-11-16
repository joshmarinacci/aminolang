if(typeof document == "undefined") {
    var amino = require('amino.js');
    var widgets= require('widgets.js'); 
}

amino.startApp(function(core,stage) {
//    runner.background = "black";
//    runner.clearBackground = true;
//    runner.fps = 30;
    stage.setSize(1024,740);
    
    var basepath = "tests/examples/matchgame/";
    var bg = new amino.ProtoImageView().setSrc(basepath+"background.png");
    var block1 = new amino.ProtoImageView().setSrc(basepath+"block1.png").setTx(730).setTy(450);
    block1.solved = false;
    var block2 = new amino.ProtoImageView().setSrc(basepath+"block2.png").setTx(550).setTy(200);
    block2.solved = false;
    var block3 = new amino.ProtoImageView().setSrc(basepath+"block3.png").setTx(300).setTy(500);
    block3.solved = false;
    
    
    
    var points = [0,109,0, 192,0,0, 192,219,0];
    var block1spot = new amino.ProtoPoly()
        .setFill("#000000").setOpacity(0.5)
        .setFilled(true)
        .setGeometry(points).setDimension(3)
        .setTx(105).setTy(60);
    var points = [0,2,0, 112,2,0, 112,219,0, 0,219,0];
    var block2spot = new amino.ProtoPoly()
        .setFill("#000000").setOpacity(0.5)
        .setFilled(true)
        .setGeometry(points).setDimension(3)
        .setTx(105).setTy(360);
    var points = [0,0,0, 83*2,0,0, 83*2,83*2,0, 0,83*2,0];
    var block3spot = new amino.ProtoPoly()
        .setFill("#000000").setOpacity(0.5)
        .setFilled(true)
        .setGeometry(points).setDimension(3)
        .setTx(705).setTy(60);
    block1.spot = block1spot;
    block2.spot = block2spot;
    block3.spot = block3spot;
    var blocks = [block1,block2,block3];
    
    var solvedOverlay = new amino.ProtoGroup();
    solvedOverlay.add(new amino.ProtoRect()
        .setTx(100).setTy(100).setW(1024-200).setH(740-200)
        .setFill("#cccccc").setOpacity(0.5));
    solvedOverlay.add(new amino.ProtoText().setText("Solved")
        .setTx(320).setTy(390).setFontSize(40).setFill("#ffffff"));
    solvedOverlay.add(new amino.ProtoText().setText("Tap to play again")
        .setTx(390).setTy(450).setFontSize(20).setFill("#ffffff"));
    solvedOverlay.setVisible(false);
    
    var blocksGroup = new amino.ProtoGroup().add(block1).add(block2).add(block3);
    
    
    // =========== splash screen ==========
    
    var splashOverlay = new amino.ProtoGroup()
        .add(new amino.ProtoRect()
            .setTx(100).setTy(100).setW(1024-200).setH(768-200)
            .setFill("#ffffff").setOpacity(0.5))
        .add(new amino.ProtoText().setText("Drag the blocks into the holes")
            .setFill("white")
            .setFontSize(30)
            .setTx(200).setTy(240))
        .add(new amino.ProtoText().setText("Tap to start")
            .setFill("white").setFontSize(20)
            .setTx(430).setTy(300))
        ;
    
    // =========== put it all together ====
    stage.setRoot(new amino.ProtoGroup()
        .add(bg)
        .add(block1spot)
        .add(block2spot)
        .add(block3spot)
        .add(blocksGroup)
        .add(solvedOverlay)
        .add(splashOverlay)
        );
    function checkSolved() {
        var s = true;
        for(var i =0; i<blocks.length; i++) {
            if(!blocks[i].solved) {
                s = false;
            }
        }
        if(s) {
            solvedOverlay.setVisible(1);
        }
    }
        /*
    runner.addCallback(function(){
        var s = true;
        for(var i =0; i<blocks.length; i++) {
            if(!blocks[i].solved) {
                s = false;
            }
        }
        if(s) {
            if(!solvedOverlay.isVisible()) {
                solvedOverlay.setVisible(true);
            }
        }
    });
    */
//    runner.start();
    /*
    function Dragger(runner, target, spot) {
        var sx = 0;
        var sy = 0;
        var started = false;
        runner.listen("MOUSE_PRESS", null, function(e) {
            if(e.node == target) {
                started = true;
                var p = target.getParent();
                p.remove(target);
                p.add(target);
            }
            sx = e.x;
            sy = e.y;
        });
        runner.listen("MOUSE_DRAG", null, function(e) {
            if(e.node && started) {
                var dx = e.x-sx;
                var dy = e.y-sy;
                sx = e.x;
                sy = e.y;
                var x = e.node.getX() + dx;
                var y = e.node.getY() + dy;
                e.node.setX(x);
                e.node.setY(y);
                if(within(target.getX(),spot.getX(),10)) {
                    if(within(target.getY(),spot.getY(),10)) {
                        target.setX(spot.getX());
                        target.setY(spot.getY());
                    }
                }
            }
        });
        runner.listen("MOUSE_RELEASE", null, function(e) {
            started = false;
            if(within(target.getX(),spot.getX(),10)) {
                if(within(target.getY(),spot.getY(),10)) {
                    target.solved = true;
                }
            }
        });
        
    };
    */
    function within(a,b,thresh) {
        return Math.abs(b-a) <= thresh;
    }

    var dragfunc = function(e) {
        var t = e.target;
        t.setTx(t.getTx()+e.dx);
        t.setTy(t.getTy()+e.dy);
    };
    
    stage.on("drag",block1,dragfunc);
    stage.on("drag",block2,dragfunc);
    stage.on("drag",block3,dragfunc);
    var releasefunc = function(e) {
        if(within(e.target.getTx(),e.target.spot.getTx(),10)) {
            if(within(e.target.getTy(),e.target.spot.getTy(),10)) {
                e.target.solved = true;
                e.target.setTx(e.target.spot.getTx());
                e.target.setTy(e.target.spot.getTy());
                checkSolved();
            }
        }
    };
    
    stage.on('release',block1, releasefunc);
    stage.on('release',block2, releasefunc);
    stage.on('release',block3, releasefunc);
    
    core.createPropAnim(splashOverlay,"tx",-1024,0,300);
    core.createPropAnim(bg,"tx",1024,0,300);
    splashOverlay.setVisible(1);
    block1spot.setVisible(0);
    block2spot.setVisible(0);
    block3spot.setVisible(0);
    blocksGroup.setVisible(0);
    stage.on("press", splashOverlay.children[0], function(e) {
          splashOverlay.setVisible(0);
          block1spot.setVisible(1);
          block2spot.setVisible(1);
          block3spot.setVisible(1);
          blocksGroup.setVisible(1);
    });
    /*
    runner.listen("MOUSE_PRESS", solvedOverlay, function(e) {
            solvedOverlay.setVisible(false);
            block1.setX(730).setY(450);
            block1.solved = false;
            block2.setX(550).setY(200).solved = false;
            block3.setX(300).setY(500).solved = false;
    });
    */
    
});
