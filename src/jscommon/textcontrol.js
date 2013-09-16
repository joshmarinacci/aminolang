console.log("loading text control");

var child_process = require('child_process');

(function(exports) {

// currently text model just uses a string of characters, but it
// exposes only Elements, so it could use other data formats internally
// in the future.
function TextModel() {
    this.listeners = [];
    this.text = "this is some text";
    this.setText = function(text) {
        this.text = text;
        this.broadcast();
    }
    this.getElementAt = function(n) {
        var ch = this.text.substring(n,n+1);
        return {
            text:ch,
            newline: (ch == '\n'),
            whitespace: (ch == ' '),
        }
    }
    this.getText = function() {
        return this.text;
    }
    
    this.getLength = function() {
        return this.text.length;
    }
    this.insertAt = function(text, index) {
        this.text = this.text.substring(0,index) + text + this.text.substring(index);
        this.broadcast();
    }
    this.deleteAt = function(count, index) {
        console.log("delete at: " + index + " " + count);
        if(index - count < 0) return false;
        this.text = this.text.substring(0,index-1) + this.text.substring(index);
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
        return "#000000";
    }
    
    this.insertAt = function(text, index) {
        var len = text.length;
        this.model.insertAt(text,index);
        var n = index;
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
    this.deleteAt = function(count, index) {
        var deleted = this.model.deleteAt(count, index);
        if(!deleted) return;
        var n = index;
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
    this.getCharAt = function(n) {
        return this.model.text.substring(n,n+1);
    }
    this.getElementAt = function(n) {
        var elem = this.model.getElementAt(n);
        elem.width = this.getCharWidth(elem.text);
        if(elem.newline) {
            elem.width = 0;
        }
        return elem;
    }
    
    this.getStringWidth = function(str) {
        var len = 0;
        for(var i=0; i<str.length; i++) {
            len += this.getCharWidth(str[i]);
        }
        return len;
    }
    this.indexToXY = function(n) {
        if(n == 0) return {x:0, y:0};
        for(var i=0; i<this.lines.length; i++) {
            var line = this.lines[i];
            if(line.start <= n && n < line.end) {
                var run = line.runs[0];
                var txt = this.model.text.substring(run.start,n);
                var x = line.x + run.x + this.getStringWidth(txt);
                var y = line.y;
                return {x:x, y:y};
            }
        }
        return { x:0, y:0 };
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
    
    this.control = null;
    this.line = null;
    this.run = null;
    this.y = 0;
    this.w = 0;
    this.lineheight = 50;
    this.endLine = function(n) {
        this.run.end = n+1;
        this.line.end = n+1;
        this.line.runs.push(this.run);
        this.lines.push(this.line);
        this.line.h = this.lineheight;
        this.line.w = this.control.getW();
        this.line = new LineBox();
        this.y+= this.lineheight;
        this.line.y = this.y;
        this.line.start = n+1;
        this.run = new RunBox();
        this.run.color = this.styles.colorAt(n);
        this.run.model = this.model;
        this.run.start = n+1;
        this.w = 0;
    }
    this.layout = function() {
        if(!this.font) return;
        this.lines = [];
        
        this.lineheight = this.font.json.height*this.font.scale;
        
        var n = 0;
        this.w = 0;
        this.y = 0;
        this.line = new LineBox();
        this.line.start = n;
        this.run = new RunBox();
        this.run.model = this.model;
        this.run.color = this.styles.colorAt(n);
        this.run.start = n;
        this.lastspace = -1;
        
        while(true) {
            var ch = this.getElementAt(n);
            if(ch.whitespace) {
                this.lastspace = n;
            }
            
            if(ch.newline) {
                this.endLine(n);
            }
            this.w += ch.width;
            if(this.wrapping && (this.w > this.control.getW() || ch == '\n')) {
                //go back to previous space
                if(this.lastspace >= 0) {
                    n = this.lastspace;
                    this.lastspace = -1;
                }
                this.endLine(n);
            }
            n++;
            if(n >= this.model.getLength()) {
                this.endLine(n);
                break;
            }
        }
        
        this.lines.forEach(function(line) {
            //console.log("line");
            line.runs.forEach(function(run) {
                console.log("   "+run.toString());
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
    this.model = null;
    this.start = 0;
    this.end = 0;
    this.color = "#ff0000";
    this.toString = function() {
        return "run: " + this.model.text.substring(this.start, this.end);
    }
}

function Cursor() {
    this.FORWARD = 1;
    this.BACKWARD = -1;
    this.index = 0;
    this.control = null;
    this.clipboard = "";
    this.bias = this.FORWARD;
    
    this.advanceChar = function(offset) {
        this.index += offset;
        if(this.index < 0) {
            this.index = 0;
            this.bias = this.BACKWARD;
        }
        if(this.index > this.model.getLength()-1) {
            this.index = this.model.getLength()-1;
            this.bias = this.FORWARD;
        }
    }
    
    this.deleteChar = function() {
        if(this.bias == this.FORWARD) {
            this.control.styles.deleteAt(1,this.index+1);
        } else {
            this.control.styles.deleteAt(1,this.index);
        }
        this.advanceChar(-1);
    }
    
    this.deleteNextChar = function() {
        if(this.bias == this.FORWARD) {
            this.control.styles.deleteAt(1,this.index+2);
        } else {
            this.control.styles.deleteAt(1,this.index+1);
        }
    }
    
    this.insertChar = function(ch) {
        if(this.bias == this.BACKWARD) {
            this.control.styles.insertAt(ch,this.index);
        } else {
            this.control.styles.insertAt(ch,this.index+1);
        }
    }
    
    this.insertNewline = function() {
        if(this.bias == this.BACKWARD) {
            this.control.styles.insertAt('\n',this.index);
            this.bias = this.BACKWARD;
            this.advanceChar(1);
        } else {
            this.control.styles.insertAt('\n',this.index+1);
            this.bias = this.BACKWARD;
            this.advanceChar(1);
        }
    }


    this.selectionActive = function() {
        return (this.control.selection != null);
    }
    this.clearSelection = function() {
        this.control.selection = null;
    }
    this.extendSelection = function(offset) {
        if(!this.control.selection) {
            this.control.selection = new TextSelection();
            this.control.selection.start = this.index;
        }
        this.index += offset;
        this.control.selection.end = this.index;
    }
    this.deleteSelection = function() {
        var sel = this.control.selection;
        var text =  this.control.model.text;
        this.control.model.text = text.substring(0,sel.getStart()) + text.substring(sel.getEnd());
        this.index = sel.getStart();
        this.control.model.broadcast();
    }
    
    this.cutSelection = function() {
        var sel = this.control.selection;
        var text =  this.control.model.text;
        this.clipboard = text.substring(sel.start,sel.end);
        this.control.model.text = text.substring(0,sel.getStart()) + text.substring(sel.getEnd());
        this.index = sel.getStart();
        this.clearSelection();
        this.control.model.broadcast();
    }
    this.pasteSelection = function() {
        var paste = child_process.spawn('pbpaste');
        console.log("spawning a process");
        var txt = "";
        var self = this;
        paste.stdout.on('data', function(data) {
                console.log("got data: " + data);
                txt += data;
        });
        paste.stdout.on('close', function() {
            console.log("done with the paste text: " + txt);
            var model = self.control.model;
            self.clipboard = txt;
            model.text = model.text.substring(0,self.index) + self.clipboard + model.text.substring(self.index);
            self.index = self.index + self.clipboard.length;
            self.control.model.broadcast();
        });
            /*
        UTILS.getClipboard(function(str) {
            console.log("got the clipboard: " + str);
            var model = this.control.model;
            model.text = model.text.substring(0,this.index) + this.clipboard + model.text.substring(this.index);
            this.index = this.index + this.clipboard.length;
            this.control.model.broadcast();
        });*/
    }
    this.copySelection = function() {
        var model = this.control.model;
        var sel = this.control.selection;
        var text =  this.control.model.text;
        this.clipboard = text.substring(sel.getStart(), sel.getEnd());
    }
    
    this.advanceLine = function(offset) {
        var lineNum = this.view.indexToLineNum(this.index);
        var oldline = this.view.getLine(lineNum);
        if(!oldline) return;
        
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

function TextSelection() {
    this.start = -1;
    this.end = -1;
    this.getStart = function() {
        if(this.end < this.start) return this.end;
        return this.start;
    }
    this.getEnd = function() {
        if(this.end < this.start) return this.start;
        return this.end;
    }
}

function JSTextControl() {
    this.selection = null;
    this.cursor = new Cursor();
    this.cursor.control = this;
    this.model = new TextModel();
    this.model.listen(this);
    this.view = new TextView();
    this.view.control = this;
    this.styles = new StyleModel();
    this.view.styles = this.styles;
    this.view.setModel(this.model);
    this.styles.model = this.model;
    this.cursor.view = this.view;
    this.cursor.model = this.model;
    this.notify = function() {
        console.log("doing nothing");
    }
    
    this.getText = function() {
        return this.model.getText();
    }
    
    this.wrapping = true;
    this.setWrapping = function(wrapping) {
        this.wrapping = wrapping;
        this.view.wrapping = wrapping;
        return this;
    }
    
    this.setFont = function(font) {
        this.font = font;
        this.view.font = font;
        return this;
    }
    this.drawSelection = function(gfx) {
        if(this.selection != null) {
            var sel = this.selection;
            var view = this.view;
            var model = this.model;
            for(var i=0; i<this.view.lines.length; i++) {
                var line = this.view.lines[i];
                //before selection
                if(line.end < sel.start) continue;
                
                var x = 0;
                //selection start on this line
                if(line.start <= sel.start && line.end > sel.start) {
                    var before = model.text.substring(line.start,sel.start);
                    x = view.getStringWidth(before);
                }
                var x2 = line.w;
                //selection starts and ends on this line
                if(line.start <= sel.start && sel.end < line.end) {
                    var during = model.text.substring(sel.start,sel.end);
                    var w = view.getStringWidth(during);
                    x2 = x + w;
                }
                
                //selection ends on this line
                if(sel.end < line.end) {
                    var during = model.text.substring(line.start, sel.end);
                    var w = view.getStringWidth(during);
                    x2 = w;
                }
                
                //selection ends before this line
                if(sel.end < line.start) continue;
                
                gfx.fillQuadColor("#88ff88", 
                    { x: line.x+x, y: line.y, w: x2-x, h:line.h });
            }
        }
    }
    this.draw = function(gfx) {
        gfx.save();

        var bds = this.getBounds();
        bds.w += 10;
        bds.h += 10;
        gfx.fillQuadColor("#888888", bds);
        bds.w -= 2;
        bds.h -= 2;
        gfx.translate(1,1);
        
        var bgcolor = "#dddddd";
        if(this.stage.getKeyboardFocus() == this) {
            bgcolor = "#ffffff";
        }
        gfx.fillQuadColor(bgcolor, bds);
        
        gfx.translate(5,5);
        var font = this.font;
        
        this.drawSelection(gfx);
        
        var ch  = this.view.getElementAt(this.cursor.index);
        //var chw = this.view.getCharWidth(ch);
        var pos = this.view.indexToXY(this.cursor.index);
        
        var chx = 0;
        if(this.cursor.bias == this.cursor.FORWARD && ch.width)  { chx = ch.width; }
        if(this.cursor.bias == this.cursor.BACKWARD) { }
        var chh = this.font.json.height* this.font.scale;

        //draw block cursor
        /*
        gfx.fillQuadColor("#aadddd", {
                x:pos.x,
                y:pos.y,
                w: ch.width,
                h: chh,
        });
        */
        
        
        //draw the actual text
        this.view.lines.forEach(function(line) {
            line.runs.forEach(function(run) {
                var txt = run.model.text.substring(run.start,run.end);
                if(txt.length < 1) return;
                gfx.fillQuadText(run.color, 
                    txt, 
                    run.x, line.y,
                    font.scaledsize, font.fontid
                    );
            });
        });
        
        
        //draw line cursor
        gfx.fillQuadColor("#ff00ff", {
                x: pos.x+chx,
                y: pos.y,
                w: 2,
                h: chh,
        });
        gfx.restore();
    }
    
    var self = this;
    this.install = function(stage) {
        self.stage = stage;
        stage.on("KEYPRESS",this,function(kp) {
            if(kp.control) {
                if(self.controlHandlers[kp.keycode]) {
                    self.controlHandlers[kp.keycode](kp);
                    return;
                }
            }
            if(self.handlers[kp.keycode]) {
                self.handlers[kp.keycode](kp);
                return;
            }
            if(kp.printable) {
                //console.log(kp);
                if(kp.printableChar == 'x' && kp.system) {
                    self.cursor.cutSelection();
                    return;
                }
                if(kp.printableChar == 'c' && kp.system) {
                    self.cursor.copySelection();
                    return;
                }
                if(kp.printableChar == 'v' && kp.system) {
                    self.cursor.pasteSelection();
                    return;
                }
                    
                self.cursor.insertChar(kp.printableChar);
                self.cursor.advanceChar(+1);
                return;
            }
        });
        var s2 = this;
        this.stage = stage;
        self.notify = function(sender) {
            s2.stage.fireEvent({
                type:"CHANGED",
                target:this
            });            
        }
        
    };
    
    var keyHandlers = {
        moveCursorBackOneCharacter:function(kp) {
            if(kp.shift) {
                self.cursor.extendSelection(-1);
            } else {
                if(self.cursor.selectionActive()) {
                    self.cursor.clearSelection();
                } else {
                    self.cursor.advanceChar(-1);
                }
            }
        },
        cursorForwardCharacter: function(kp) { // right arrow
            if(kp.shift) {
                self.cursor.extendSelection(+1);
            } else {
                if(self.cursor.selectionActive()) {
                    self.cursor.clearSelection();
                } else {
                    self.cursor.advanceChar(+1);
                }
            }
        },
        cursorLineStart:function(kp) {
            if(self.cursor.selectionActive()) {
                self.cursor.clearSelection();
            }
            //get the line number
            var lineNum = self.view.indexToLineNum(self.cursor.index);
            //get the line box
            var linebox = self.view.getLine(lineNum);
            //move cursor to start of the line
            self.cursor.index = linebox.start;
            //set the bias
            self.cursor.bias = self.cursor.BACKWARD;
        },
        cursorLineEnd:function(kp) {
            if(self.cursor.selectionActive()) {
                self.cursor.clearSelection();
            }
            //get the line number
            var lineNum = self.view.indexToLineNum(self.cursor.index);
            //get the line box
            var linebox = self.view.getLine(lineNum);
            //move cursor to start of the line
            console.log('end of line = ' + (linebox.end-1));
            self.cursor.index = linebox.end-1;
            //set the bias
            self.cursor.bias = self.cursor.FORWARD;
        },
        cursorNextLine: function(kp) {
            if(kp.shift) {
            } else {
                if(self.cursor.selectionActive()) {
                    self.cursor.clearSelection();
                } else {
                    self.cursor.advanceLine(+1);
                }
            }
        },
        cursorPrevLine: function(kp) {
            if(kp.shift) {
            } else {
                if(self.cursor.selectionActive()) {
                    self.cursor.clearSelection();
                } else {
                    self.cursor.advanceLine(-1);
                }
            }
        },
        cursorDeletePrevChar: function(kp) {
            console.log("deleting previous char. index = " + self.cursor.index);
            if(self.cursor.index - 1 < -1) return;
            if(self.cursor.selectionActive()) {
                self.cursor.deleteSelection();
                self.cursor.clearSelection();
            } else {
                self.cursor.deleteChar();
            }
        },
        cursorDeleteNextChar: function(kp) {
            //            if(self.cursor.index - 1 < 0) return;
            if(self.cursor.selectionActive()) {
                self.cursor.deleteSelection();
                self.cursor.clearSelection();
            } else {
                self.cursor.deleteNextChar();
            }
        },
    };
    
    this.handlers = {
        283: keyHandlers.cursorPrevLine, //up arrow
        284: keyHandlers.cursorNextLine, //down arrow
        285: keyHandlers.moveCursorBackOneCharacter, // left arrow
        286: keyHandlers.cursorForwardCharacter, // right arrow
        295: keyHandlers.cursorDeletePrevChar, // backspace key
        294: function(kb) { // enter/return key
            if(!kb.target.wrapping) {
                kb.target.stage.fireEvent({
                    type:"ACTION",
                    target:kb.target
                });
                return;
            }
            self.cursor.insertNewline();
        },
    }
    this.controlHandlers = {
        80: keyHandlers.cursorPrevLine, // ctl-P prev line
        78: keyHandlers.cursorNextLine, // ctl-N next line
        66: keyHandlers.moveCursorBackOneCharacter, // ctl-B backward
        70: keyHandlers.cursorForwardCharacter, // ctl-F forward 
        68: keyHandlers.cursorDeleteNextChar, // ctl-D delete next char
        65: keyHandlers.cursorLineStart, //ctl-A start of line action
        69: keyHandlers.cursorLineEnd, //ctl-E end of line action
    };
    
    this.setNewlineText = function(text) {
        this.model.setText(text);
    }
    this.setText = function(text) {
        this.model.setText(text);
    }
    this.getText = function() {
        return this.model.getText();
    }
    
    this.getVisible = function() { return true; }
    this.tx = 0;
    this.ty = 0;
    this.x = 0;
    this.y = 0;
    this.w = 100;
    this.getTx = function() { return this.tx; }
    this.getTy = function() { return this.ty; }
    this.setTx = function(tx) { this.tx = tx; return this; }
    this.setTy = function(ty) { this.ty = ty; return this; }
    this.setW = function(w) { this.w = w; return this; }
    this.setH = function(h) { this.h = h; return this; }
    this.getW = function() { return this.w; }
    this.getH = function() { return this.h; }
    this.setParent = function(p) { this.parent = p; return this; }
    this.contains = function(pt){
        if(pt.x<this.x){
            return false;}
        ;
            if(pt.x>this.x+this.w){
            return false;}
        ;
            if(pt.y<this.y){
            return false;}
        ;
            if(pt.y>this.y+this.h){
            return false;}
        ;
        return true;
    }
    this.getBounds = function() {
        return {
            x:0,
            y:0,
            w:this.w,
            h:this.h
        };
    }
}
exports.JSTextControl = JSTextControl;

})(typeof exports === 'undefined'? this['textcontrol'] = {}:exports);


