console.log("loading widgets");

(function(exports) {


function CommonPushButton() {
    this.setW(150).setH(40);
    this.setBaseColor("#aaaaaa");
    
    this.getBounds = function() {
        return {x:this.x, y:this.y, w:this.w, h:this.h };
    };
    
    this.draw = function(gfx) {
        var bounds = this.getBounds();

        gfx.fillRect(this.getBaseColor(), bounds);
        //gfx.strokeRect("#000000",bounds);
        
        var x = bounds.x;
        //draw the icon
        if(this.url) {
            if(!this.iconImage && !this.iconLoading) {
                this.iconLoading = true;
                this.iconImage = amino.loadPngFromBuffer("/Users/josh/projects/temp/"+this.url);
            }
            if(this.iconImage) {
                x += 10;
                gfx.fillQuadTexture(this.iconImage.texid, x,0, this.iconImage.w, this.iconImage.h);
                //x += this.iconImage.w;  image is too big right now. assume 30px
                x += 30;
                x += 10;
            }
        }
        var w = this.font.calcStringWidth(this.getText(), this.getFontSize(), gfx);
        x += (bounds.w-w)/2;

        var y = bounds.y;
        var h = this.font.getHeight(this.getFontSize(), gfx);
        y = bounds.y + (bounds.h-h)/2 + h/2;
        gfx.drawText("#000000",this.getText(), x, y, this.getFontSize(), this.font);
        
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

function CommonLabel() {
    this.setTextColor("#000000");
    this.draw = function(gfx) {
        var bnds = this.getBounds();
        gfx.drawText(this.getTextColor(), this.getText(), bnds.x+10, bnds.y+3, this.getFontSize(), this.font);
    };
    this.getBounds = function() {
        return { x:this.x, y:this.y, w:this.w, h:this.h };
    };
    this.install = function(stage) {
    }
}

exports.CommonLabel = CommonLabel;

function CommonSlider() {
    this.setTextColor("#000000");
    this.w = 200;
    this.h = 100;
    this.setBaseColor("#888888");
    this.valueToPoint = function(v) {
        return (this.value-this.minvalue) *
            (this.w / (this.maxvalue-this.minvalue));
    }
    this.pointToValue = function(p) {
        return p * (this.maxvalue-this.minvalue)/this.w + this.minvalue;
    }
    this.draw = function(gfx) {
        var bounds = this.getBounds();
        gfx.fillRect(this.getBaseColor(),this.getBounds());
        var v = this.valueToPoint(this.value);
        var bds = { 
            x: bounds.x,
            y: bounds.y,
            w: v,
            h: bounds.h
        };
        gfx.fillRect("#ff0000", bds);
        
    }
    
    var self = this;
    this.install = function(stage) {
        stage.on("DRAG", this, function(e) {
            var r = e.target;
            r.setValue(r.pointToValue(e.point.x-r.getTx()));
        });
    }
    
    this.getBounds = function() {
        return { x:this.x, y:this.y, w:this.w, h:this.h };
    };
}

exports.CommonSlider = CommonSlider;

function CommonListView() {
    var self = this;
    this.selectedIndex = -1;
    this.w = 100;
    this.h = 200;
    this.cellHeight = 32;
    this.cellWidth = 32;
    this.DEBUG = false;
    this.listModel = [];
    for(var i=0; i<30; i++) {
        this.listModel.push(i+"");
    }
    this.getBounds = function() {
        return {x:self.x, y:self.y, w:self.w, h:self.h };
    };
    this.scroll = 0;
    this.layout = "vert";
    this.draw = function(gfx) {
        var bounds = this.getBounds();
        var b = {
            x:0,
            y:+this.getTy()*2+40*2,
            w:bounds.w*2,
            h:bounds.h*2
        }
        //gfx.enableClip(b);
        
        
        //border
        var border = self.getBounds();
        border.x--;
        border.y--;
        border.w+=2;
        border.h+=2;
        gfx.fillRect("#000000", border);
        
        //background
        gfx.fillRect("#ccffff",this.getBounds());
        this.drawCells(gfx);
        //gfx.disableClip();
    }
    this.drawCells = function(gfx) {
        if(this.layout == "horizwrap") {
            var lx = 0;
            var ly = -this.scroll;
            for(var i=0; i<this.listModel.length; i++) {
                if(ly >= 0 - this.cellHeight && ly < this.getH()) {
                    if(this.cellRenderer) {
                        this.cellRenderer(gfx, this.listModel[i], {x:lx, y:ly, w:this.cellWidth-2, h:this.cellHeight-2});
                    } else {
                        gfx.fillRect("#888888", {x:lx, y:ly, w:this.cellWidth-2, h:this.cellHeight-2});
                        gfx.drawText("#000000", this.listModel[i], lx, ly,this.getFontSize(), this.font);
                    }
                }
                lx += this.cellWidth;
                if(lx + this.cellWidth > this.getW()) {
                    lx = 0;
                    ly += this.cellHeight;
                }
            }
            return;
        }
        
        if(this.layout == "horiz") {
            for(var i=0; i<this.listModel.length; i++) {
                var lx = -this.scroll;
                var ly = 0;
                for(var i=0; i<this.listModel.length; i++) {
                    gfx.fillRect("#888888", {x:lx, y:ly, w:this.cellWidth-2, h:this.getH()-2});
                    lx += this.cellWidth;
                }
            }
        }
        
        if(this.layout == "vert") {
            var bnds = self.getBounds();
            for(var i=0; i<this.listModel.length; i++) {
                var y = i*this.cellHeight;
                if(y < this.scroll-this.cellHeight) continue;
                if(y > this.getH()+this.scroll) break;
                var fillBounds = {
                            x:bnds.x, 
                            y:bnds.y+3+y-this.scroll,
                            w:this.getW(), 
                            h:this.cellHeight
                        };
                if(this.cellRenderer) {
                    this.cellRenderer(gfx, 
                        {
                            list:this,
                            index:i,
                            item:this.listModel[i]
                        },
                        fillBounds
                        );
                } else {
                    if(this.selectedIndex == i) {
                        gfx.fillRect("#6666ff",fillBounds);
                    }
                    gfx.drawText("#000000", 
                        this.listModel[i],
                        bnds.x+10, bnds.y+3+y-this.scroll,
                        this.getFontSize(), this.font);
                }
            }
            return;
        }
        
        
        
    }
    
    this.install = function(stage) {
        var pressPoint = null;
        stage.on("PRESS", this, function(e) {
            pressPoint = e.point;
        });
        stage.on("DRAG", this, function(e) {
            var maxScroll = 100;
            if(self.layout == "vert") {
                self.scroll -= e.delta.y;
                maxScroll = self.cellHeight * self.listModel.length - self.getH();
            }
            if(self.layout == "horiz") {
                self.scroll -= e.delta.x;
                maxScroll = self.cellWidth * self.listModel.length - self.getW();
            }
            if(self.layout == "horizwrap") {
                self.scroll -= e.delta.y;
                var rowLen = Math.floor(self.getW() / self.cellWidth);
                var rows = Math.ceil(self.listModel.length / rowLen);
                maxScroll = self.cellHeight * rows - self.getH();
            }
            
            if(self.scroll < 0) self.scroll = 0;
            if(self.scroll > maxScroll) {
                self.scroll = maxScroll;
            }
        });
        stage.on("RELEASE", this, function(e) {
            if(!pressPoint) return;
            var dx = e.point.x-pressPoint.x;
            var dy = e.point.y-pressPoint.y;
            if(Math.abs(dx) < 5 && Math.abs(dy) < 5) {
                var event = {
                    type:"SELECT",
                    target:self,
                }
                if(self.layout == "vert") {
                    event.index = -99;
                    var py = e.point.y -self.getTy() + self.scroll;
                    var index = Math.round(py/self.cellHeight);
                    index--;
                    if(index < 0) index = 0;
                    if(index > self.listModel.length-1) {
                        index = self.listModel.length;
                    }
                    event.index = index;
                    self.selectedIndex = index;
                }
                stage.fireEvent(event);
            }
        });
        stage.on("KEYPRESS",this,function(kp) {
            if(kp.keycode == 283) {
                self.setSelectedIndex(self.getSelectedIndex()-1);
                stage.fireEvent({type:"SELECT",target:self});
            }
            if(kp.keycode == 284) {
                console.log("down arrow");
                self.setSelectedIndex(self.getSelectedIndex()+1);
            }
            console.log("sel = " + self.getSelectedIndex());
        });
        
    }
    
    this.setSelectedIndex = function(n) {
        this.selectedIndex = n;
        if(this.selectedIndex < 0) {
            this.selectedIndex = 0;
        }
        if(this.selectedIndex > this.listModel.length-1) {
            this.selectedIndex = this.listModel.length-1;
        }
        this.markDirty();
        return this;
    }
}
exports.CommonListView = CommonListView;

})(typeof exports === 'undefined'? this['widgets'] = {}:exports);


