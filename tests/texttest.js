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
    this.insertAt = function(text, cursor) {
        //update the text
        p("old text = " + this.text);
        this.text = this.text.substring(0,cursor.index) + text + this.text.substring(cursor.index);
        p("new text = " + this.text);
        //fire a change
        this.broadcast();
    }
    this.deleteAt = function(count, cursor) {
        p("old text = " + this.text);
        this.text = this.text.substring(0,cursor.index-1) + this.text.substring(cursor.index);
        p("new text = " + this.text);
        this.broadcast();
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
}
function TextView() {
    this.lines = [];
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
        return w;
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
    
    this.line = null;
    this.run = null;
    this.endLine = function(n) {
        this.run.end = n+1;
        this.line.end = n+1;
        this.line.runs.push(this.run);
        this.lines.push(this.line);
        this.line = new LineBox();
        this.line.start = n+1;
        this.run = new RunBox();
        this.run.text = this.model.text;
        this.run.start = n+1;
    }
    this.layout = function() {
        if(!this.font) return;
        p("doing layout");
        //p(this.font.json);
        this.lines = [];
        
        var maxW = 300;
        var lineheight = this.font.json.height;
        console.log("line height = " + lineheight);
        var w = 0;
        var n = 0;
        var y = 0;
        this.line = new LineBox();
        this.line.start = n;
        this.run = new RunBox();
        this.run.text = this.model.text;
        this.run.start = n;
        while(true) {
            var ch = this.model.text.substring(n,n+1);
            w += this.getCharWidth(ch);
            if(w > maxW || ch == '\n') {
                y+= lineheight;
                this.endLine(n);
                this.line.y = y;
                w = 0;
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
    this.color = new amino.Color(0,1,0);
    this.toString = function() {
        return "run: " + this.text.substring(this.start, this.end);
    }
}
function Cursor() {
    this.index = 0;
    this.advanceChar = function(offset) {
        this.index += offset;
        //var xy = this.view.indexToXY(this.index);
    }
    this.advanceLine = function(offset) {
        var lineNum = this.view.indexToLine(this.index);
        p("current index and line = " + this.index + " " + lineNum);
        lineNum += offset;
        this.index = this.view.lineToIndex(lineNum);
        p("new     index and line = " + this.index + " " + lineNum);
    }
}

function TextArea() {
    this.cursor = new Cursor();
    this.model = new TextModel();
    this.view = new TextView();
    this.view.setModel(this.model);
    this.getBounds = function() {
        return {
            x:0,
            y:0,
            w:300,
            h:200
        };
    }
    this.draw = function(gfx) {
        gfx.fillQuadColor(new amino.Color(1,0,0), this.getBounds());
        var font = this.font;
        this.view.lines.forEach(function(line) {
            line.runs.forEach(function(run) {
                gfx.fillQuadText(run.color, run.text.substring(run.start,run.end), run.x, line.y,
                    20,font.fontid
                    );
            });
        });
        var pos = this.view.indexToXY(this.cursor.index);
        gfx.fillQuadColor(new amino.Color(0,0,1), {
                x: pos.x,
                y: pos.y+10,
                w: 2,
                h: 40
        });
    }
    
    var self = this;
    this.install = function(stage) {
        stage.on("KEYPRESS",this,function(kp) {
            p(kp.keycode);
            if(self.handlers[kp.keycode]) {
                self.handlers[kp.keycode](kp);
                return;
            }
            if(kp.printable) {
                self.model.insertAt(kp.textChar,self.cursor);
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
            self.model.deleteAt(1,self.cursor);
            self.cursor.advanceChar(-1);
        },
        DOWN: function(kp) {
            this.cursor.advanceLine(+1);
        },
        UP: function(kp) {
            this.cursor.advanceLine(-1);
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

var nltext = "This is some text for you to read.\nIt has two lines.";
var view = new TextArea();
view.setNewlineText(nltext);
view.font = font;
view.view.font = font;
view.view.layout();
view.install(stage);
stage.setRoot(view);


/*
var jsonfile = fs.readFileSync("tests/test1.json");
var fontjson = JSON.parse(jsonfile);
*/
//var g = core.createGroup();
//var rect = core.createRect().setW(500).setH(500).setFill("#ff0000");
//g.add(rect);
/*
var label = core.createLabel();
label.setText("Greetings Earthling!");
label.font = font;
g.add(label);
stage.setRoot(g);
*/

setTimeout(function() {
    core.start();
    //label.font = font;
},1000);

