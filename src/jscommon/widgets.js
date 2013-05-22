console.log("loading widgets");

(function(exports) {


function CommonPushButton() {
    this.setW(150).setH(40);
    this.setBaseColor("#aaaaaa");
    
    this.getBounds = function() {
        return {x:this.x, y:this.y, w:this.w, h:this.h };
    };
    
    this.draw = function(gfx) {
        gfx.fillRect(this.getBaseColor(), this.getBounds());
        //gfx.strokeRect("#000000",this.getBounds());
        gfx.drawText("#000000",this.getText(),this.getX()+5, this.getY()+20, this.getFontSize(), this.font);
    };
    
    this.install = function(stage) {
        var self = this;
        stage.on("PRESS", this, function(e) {
            self.setBaseColor("#aaaaff");
        });
        stage.on("RELEASE", this, function(e) {
            self.setBaseColor("#aaaaaa");
            stage.fireEvent({
                    type:"ACTION",
                    target:self
            });
        });
    };
}

exports.CommonPushButton = CommonPushButton;

function CommonToggleButton() {
    this.setW(150).setH(40);
    this.setBaseColor("#aaaaaa");
    
    this.getBounds = function() {
        return {x:this.x, y:this.y, w:this.w, h:this.h };
    };
    
    this.draw = function(gfx) {
        if(this.getSelected()) {
            gfx.fillRect("#8888ff", this.getBounds());
        } else {
            gfx.fillRect(this.getBaseColor(), this.getBounds());
        }
        //g.strokeRect("#000000",this.getBounds());
        gfx.drawText("#000000",this.getText(),this.getX()+5, this.getY()+20, this.getFontSize(), this.font);
    };
    
    this.install = function(stage) {
        var self = this;
        stage.on("PRESS", this, function(e) {
            self.setBaseColor("#aaaaff");
        });
        stage.on("RELEASE", this, function(e) {
            self.setBaseColor("#aaaaaa");
            self.setSelected(!self.getSelected());
        });
    };
    
}
exports.CommonToggleButton = CommonToggleButton;

})(typeof exports === 'undefined'? this['widgets'] = {}:exports);


