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
    }
    this.navstack = [];
    
    this.push = function(name) {
        var trans = this.transitions[name];
        console.log("got the transition " + trans.type);
        if(trans.type == "popup") {
            trans.dst.setVisible(true);
            var w = trans.src.getTx() + trans.src.getW();
            trans.dst.setTx(w+10);
            trans.dst.setTy(10);
        } else {
            stage.addAnim(amino.anim(trans.src, "tx", 0, -stage.width, 250));
            stage.addAnim(amino.anim(trans.dst, "tx", stage.width,  0, 250)
                .before(function(){ trans.dst.setVisible(true);})
                );
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
