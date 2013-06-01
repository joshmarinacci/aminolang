function NavigationManager(stage) {
    this.panels = [];
    this.register = function(panel) {
        this.panels.push(panel);
    }
    this.transitions = {};
    this.createTransition = function(name,src,dst,type) {
        this.transitions[name] = {
            name:name,
            src:src,
            dst:dst,
            type:type
        };
        if(type == "popup") {
            dst.setVisible(false);
        }
    }
    this.navstack = [];
    
    this.push = function(name) {
        var trans = this.transitions[name];
        try {
        if(trans.type == "popup") {
            trans.dst.setVisible(true);
            var x2 = trans.src.getTx() + trans.src.getW() + 10;
            var pw = trans.dst.getW();
            trans.dst.setTy(10);
            if(x2 > stage.getW() - pw) {
                console.log("doing on the left");
                x2 = trans.src.getTx() - pw - 10;
                trans.dst.setTx(x2);
            } else {
                console.log("doing on the right");
                trans.dst.setTx(x2);
            }
        } else {
            stage.addAnim(amino.anim(trans.src, "tx", 0, -stage.width, 250));
            stage.addAnim(amino.anim(trans.dst, "tx", stage.width,  0, 250)
                .before(function(){ trans.dst.setVisible(true);})
                );
        }
        } catch (e) {
            console.log(e);
        }
        this.navstack.push(trans);
    }
    this.pop = function() {
        var trans = this.navstack.pop();
        if(trans.type == "popup") {
            trans.dst.setVisible(false);
        } else {
            stage.addAnim(amino.anim(trans.src, "tx", -400, 0, 250));
            stage.addAnim(amino.anim(trans.dst, "tx", 0,  400, 250)
                .after(function() { trans.dst.setVisible(false); })
                );
        }
    }
    var self = this;
    stage.on("WINDOWSIZE", stage, function(e) {
        for(var i in self.panels) {
            var panel = self.panels[i];
            panel.setW(e.width).setH(e.height-30);
            if(panel.getParent() && panel.getParent().type == "Transform") {
                panel.setTy(0);
            } else {
                panel.setTy(30);
            }
        }
    });
}


exports.NavigationManager = NavigationManager;
