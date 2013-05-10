var fs = require('fs');
var amino = require('../src/node/amino.js');
var core = amino.getCore();
core.setDevice("mac");
var stage = core.createStage();

function p(s) { console.log(s); }
function TextModel() {
    this.listeners = [];
    this.text = "this is some text";
    this.setText = function(text) {
        this.text = text;
        this.broadcast();
    }
    this.getLength = function() {
        return this.text.length;
    }
    this.insertAt = function(text, cursor) {
        //update the text
        this.text = this.text.substring(0,cursor.index) + text + this.text.substring(cursor.index);
        //fire a change
        this.broadcast();
    }
    this.deleteAt = function(count, cursor) {
        if(cursor.index - count < 0) return false;
        this.text = this.text.substring(0,cursor.index-1) + this.text.substring(cursor.index);
        this.broadcast();
        return true;
    }
    this.listen = function(listener) {
        this.listeners.push(listener);
    }
    this.broadcast = function() {
        var self = this;
        this.listeners.forEach(function(listener) {
            listener.notify(self);
        });
    }
}
function StyleModel() {
    this.runs = [];
    /*
    this.runs.push({
            start: 5,
            end: 10,
            color: new amino.Color(0,1,0),
    });
    
    this.runs.push({
            start:20,
            end: 25,
            color: new amino.Color(0,0,1),
    });
    
    
    this.runs.push({
            start:40,
            end:-1,
            atomic:true,
            kind:"newline",
    });
    */
    
    this.doesStyleChange = function(n) {
        for(var i=0; i<this.runs.length; i++) {
            if(this.runs[i].start == n) return true;
            if(this.runs[i].end   == n) return true;
        }
        return false;
    }
    this.colorAt = function(n) {
        for(var i=0; i<this.runs.length; i++) {
            var run = this.runs[i];
            if(n >= run.start && n < run.end) {
                if(run.color) {
                    return run.color;
                }
            }
        }
        return new amino.Color(0,0,0);
    }
    
    this.newlineAt = function(n) {
        for(var i=0; i<this.runs.length; i++) {
            var run = this.runs[i];
            if(run.start == n && run.atomic && run.kind == "newline") {
                return true;
            }
        }
        return false;
    }
    this.insertAt = function(text, cursor) {
        var len = text.length;
        this.model.insertAt(text,cursor);
        var n = cursor.index;
        for(var i=0; i<this.runs.length; i++) {
            var run = this.runs[i];
            //before the run
            if(n < run.start) {
                run.start += len;
                run.end += len;
            }
            //inside the run
            if(n >= run.start && n < run.end) {
                run.end += len;
            }
        }
    }
    this.deleteAt = function(count, cursor) {
        var deleted = this.model.deleteAt(count, cursor);
        if(!deleted) return;
        var n = cursor.index;
        var toremove = [];
        for(var i=0; i<this.runs.length; i++) {
            var run = this.runs[i];
            if(n < run.start) {
                run.start -= count;
                run.end   -= count;
                continue;
            }
            if(n == run.start && run.atomic) {
                toremove.push(run);
                continue;
            }
            if(n == run.start && run.end <= run.start) {
                toremove.push(run);
                continue;
            }
            if(n >= run.start && n < run.end) {
                run.end   -= count;
                continue;
            }
        }
        var self = this;
        toremove.forEach(function(item) {
            var n = self.runs.indexOf(item);
            self.runs.splice(n,1);
        });
    }
    this.insertNewline = function(cursor) {
        this.runs.push({
                start:cursor.index-1,
                end:-1,
                atomic:true,
                kind:"newline",
        });
        this.model.broadcast();
    }
}
function TextView() {
    this.lines = [];
    this.wrapping = true;
    this.setModel = function(model) {
        this.model = model;
        this.model.listen(this);
    }
    this.notify = function(sender) {
        this.layout();
    }
    this.getCharWidth = function(ch) {
        var code = ch.charCodeAt(0);
        var n = code-this.font.json.minchar;
        var w = this.font.json.widths[n];
        return w*this.font.scale;
    }
    this.getStringWidth = function(str) {
        var len = 0;
        for(var i=0; i<str.length; i++) {
            len += this.getCharWidth(str[i]);
        }
        return len;
    }
    this.indexToXY = function(n) {
        for(var i=0; i<this.lines.length; i++) {
            var line = this.lines[i];
            if(line.start <= n && n <= line.end) {
                var run = line.runs[0];
                var inset = n-run.start;
                var txt = this.model.text.substring(run.start,n);
                var x = line.x + run.x + this.getStringWidth(txt);
                var y = line.y;
                return {x:x, y:y};
            }
        }
        return null;
    }
    this.indexToLineNum = function(n) {
        for(var i=0; i<this.lines.length; i++) {
            var line = this.lines[i];
            if(line.start <= n && n <= line.end) {
                return i;
            }
        }
        return -1;
    }
    this.getLine = function(n) {
        return this.lines[n];
    }
    
    this.line = null;
    this.run = null;
    this.y = 0;
    this.w = 0;
    this.endLine = function(n) {
        this.run.end = n+1;
        this.line.end = n+1;
        this.line.runs.push(this.run);
        this.lines.push(this.line);
        this.line = new LineBox();
        this.y+= this.lineheight;
        this.line.y = this.y;
        this.line.start = n+1;
        this.run = new RunBox();
        this.run.color = this.styles.colorAt(n);
        this.run.text = this.model.text;
        this.run.start = n+1;
        
        this.w = 0;
    }
    this.layout = function() {
        if(!this.font) return;
        p("doing layout");
        //p(this.font.json);
        this.lines = [];
        
        var maxW = 300;
        this.lineheight = this.font.json.height*this.font.scale;
        var n = 0;
        this.w = 0;
        this.y = 0;
        this.line = new LineBox();
        this.line.start = n;
        this.run = new RunBox();
        this.run.color = this.styles.colorAt(n);
        this.run.text = this.model.text;
        this.run.start = n;
        this.lastspace = -1;
        while(true) {
            
            var change = this.styles.doesStyleChange(n)
            if(change) {
                this.run.end = n;
                this.line.runs.push(this.run);
                
                var newline = this.styles.newlineAt(n);
                if(newline) {
                    this.endLine(n);
                } else {
                    this.run = new RunBox();
                    this.run.color = this.styles.colorAt(n);
                    this.run.x = this.w;
                    this.run.text = this.model.text;
                    this.run.start = n;
                }
            }
            
            
            var ch = this.model.text.substring(n,n+1);
            if(ch == ' ') {
                lastspace = n;
            }
            this.w += this.getCharWidth(ch);
            console.log("wrapping = " + this.wrapping);
            if(this.wrapping && (this.w > maxW || ch == '\n')) {
                //p("breaking line. prev space at " + lastspace);
                //go back to previous space
                if(lastspace >= 0) {
                    n = lastspace;
                    lastspace = -1;
                }
                this.endLine(n);
            }
            n++;
            if(n >= this.model.text.length) {
                this.endLine(n);
                break;
            }
        }
        
        this.lines.forEach(function(line) {
            p("line");
            line.runs.forEach(function(run) {
                p("   "+run.toString());
            });
        });
    }
}
function LineBox() {
    this.x = 0;
    this.y = 0;
    this.runs = [];
}
function RunBox() {
    this.x = 0;
    this.y = 0;
    this.text = "";
    this.start = 0;
    this.end = 0;
    this.color = new amino.Color(1,0,0);
    this.toString = function() {
        return "run: " + this.text.substring(this.start, this.end);
    }
}
function Cursor() {
    this.index = 0;
    this.advanceChar = function(offset) {
        this.index += offset;
        if(this.index < 0) {
            this.index = 0;
        }
        if(this.index > this.model.getLength()-1) {
            this.index = this.model.getLength()-1;
        }
    }
    this.advanceLine = function(offset) {
        var lineNum = this.view.indexToLineNum(this.index);
        var oldline = this.view.getLine(lineNum);
        
        //how many chars into the oldline are we
        var inset = this.index - oldline.start;

        //move to the new line
        lineNum += offset;
        var newline = this.view.getLine(lineNum);
        
        //if we are off the end of the document now
        if(!newline) {
            //if going down, move to end of line
            if(offset >= 0) {
                this.index = oldline.end-1;
            } else {
                //else move to start of line
                this.index = oldline.start;
            }
            return;
        }
        
        //calc new index
        this.index = newline.start+inset;
        //if too long for the new line, go to end of new line
        if(this.index > newline.end-1) {
            this.index = newline.end-1;
        }
        
        //done!
        
        //p("new     index and line = " + this.index + " " + lineNum);
    }
}

function TextControl() {
    this.wrapping = true;
    this.cursor = new Cursor();
    this.model = new TextModel();
    this.view = new TextView();
    this.styles = new StyleModel();
    this.view.styles = this.styles;
    this.view.setModel(this.model);
    this.styles.model = this.model;
    this.cursor.view = this.view;
    this.cursor.model = this.model;
    this.getBounds = function() {
        return {
            x:0,
            y:0,
            w:300,
            h:200
        };
    }
    this.draw = function(gfx) {
        gfx.save();

        var bds = this.getBounds();
        bds.w += 10;
        bds.h += 10;
        gfx.fillQuadColor(new amino.Color(0.5,0.5,0.5), bds);
        bds.w -= 2;
        bds.h -= 2;
        gfx.translate(1,1);
        gfx.fillQuadColor(new amino.Color(1,1,1), bds);
        
        gfx.translate(5,5);
        var font = this.font;
        this.view.lines.forEach(function(line) {
            line.runs.forEach(function(run) {
                gfx.fillQuadText(run.color, 
                    run.text.substring(run.start,run.end), 
                    run.x, line.y,
                    font.scaledsize, font.fontid
                    );
            });
        });
        var pos = this.view.indexToXY(this.cursor.index);
        var h = this.font.json.height* this.font.scale;
        gfx.fillQuadColor(new amino.Color(1,0,1), {
                x: pos.x,
                y: pos.y,
                w: 2,
                h: this.font.json.height*this.font.scale
        });
        gfx.restore();
    }
    
    var self = this;
    this.install = function(stage) {
        stage.on("KEYPRESS",this,function(kp) {
            console.log(kp.keycode);
            if(self.handlers[kp.keycode]) {
                self.handlers[kp.keycode](kp);
                return;
            }
            if(kp.printable) {
                self.styles.insertAt(kp.printableChar,self.cursor);
                self.cursor.advanceChar(+1);
                return;
            }
        });
    };
    
    var self = this;
    this.handlers = {
        285: function(kp) { // left arrow
            self.cursor.advanceChar(-1);
        },
        286: function(kp) { // right arrow
            self.cursor.advanceChar(+1);
        },
        295: function(kp) { //delete/backspace key
            if(self.cursor.index - 1 < 0) return;
            self.styles.deleteAt(1,self.cursor);
            self.cursor.advanceChar(-1);
        },
        284: function(kp) { // down arrow
            self.cursor.advanceLine(+1);
        },
        283: function(kp) { // up arrow
            self.cursor.advanceLine(-1);
        },
        294: function(kb) { // enter/return key
            if(!self.wrapping) return;
            self.styles.insertNewline(self.cursor);
            //self.cursor.advanceChar(1);
        },
    }
    
    this.setNewlineText = function(text) {
        this.model.setText(text);
    }
    
    this.getVisible = function() { return true; }
    this.getTx = function() { return 0; }
    this.getTy = function() { return 0; }
    this.contains = function() { return true; }
}

var font = core.createFont("tests/test1.json","tests/test1.png",2153, 58);
font.basesize = font.json.size;
font.scaledsize = 20;
font.scale = font.scaledsize/font.basesize
console.log("scale = " + font.scale);

var nltext = "'The Way' is a song by the American alternative rock band Fastball. It was released in February 1998 as the lead single from their second studio album, All the Pain Money Can Buy.";
//var nltext = "This is some text for you to read. It has two lines.";
/*
var view = new TextControl();
view.setNewlineText(nltext);
view.font = font;
view.view.font = font;
view.view.layout();
view.install(stage);
stage.setRoot(view);
*/

function TextArea(font) {
    TextControl();
    this.wrapping = true;
    this.font = font;
    this.view.font = font;
    this.view.wrapping = this.wrapping;
    this.view.layout();
}
TextArea.extend(TextControl);

function TextField(font) {
    TextControl();
    this.wrapping = false;
    this.font = font;
    this.view.font = font;
    this.view.wrapping = this.wrapping;
    this.view.layout();
    this.getBounds = function() {
        return {
            x:0,
            y:0,
            w:300,
            h:30
        };
    }
}
TextField.extend(TextControl);


var view = new TextField(font);
view.install(stage);
view.setNewlineText(nltext);
stage.setRoot(view);

setTimeout(function() {
    core.start();
},1000);

