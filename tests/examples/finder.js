var amino = require('../../build/desktop/amino.js');
var widgets = require('../../build/desktop/widgets.js');


var db = require('../phone/database').makeDB();

var doctypes = {
    email: "com.joshondesign.aminos.email.message",
    song:  "com.joshondesign.aminos.music.song",
    text:  "com.joshondesign.aminos.text.plain",
    person:  "com.joshondesign.aminos.contacts.person",
}

for(var i=0; i<10; i++) {
    db.insert({doctype:doctypes.email, doc: {
        title:"an email "+i,
        from: "foo@bar.com",
        to: "bar@foo.com",
        subject:"Subjects are for the weak!"+Math.floor(Math.random()*100),
        body: "Hah. You read the message! Foolish mortal.",
    }});
}

for(var i=0; i<10; i++) {
    db.insert({doctype:doctypes.song, doc: {
            title: "Song " + i,
            artist: "Bob",
            album: "Bob's Songs",
    }});
}

for(var i=0; i<3; i++) {
    db.insert({doctype:doctypes.text, doc: {
        title: "Text " + i,
        content: "This is some contents in the text document",
    }});
}

for(var i=0; i<20; i++) {
    db.insert({doctype:doctypes.person, doc: {
        title: "Bob Smith",
        firstname: "Bob",
        lastname: "Smith",
    }});
}



var windowlist = [];


IconView = amino.ComposeObject({
    type:"IconView",
    extend:amino.ProtoWidget,
    comps: {
        background: {
            proto: amino.ProtoRect,
            promote: ['fill','w','h'],
        },
        title: {
            proto: widgets.Label,
            promote: ['text'],
        },
    },
    props: {
        item: {
            value: null,
            set: function(item) {
                this.props.item = item;
                return this;
            }
        }
    },
    
    init: function() {
        this.comps.base.add(this.comps.background);
        this.comps.base.add(this.comps.title);
        this.comps.title.setTx(5).setTy(5);
        var self = this;
        amino.getCore().on('click',this,function(e) {
            openView(self.getItem());
        });
        
    }
});


var root = null;
function openView(item) {
    console.log("folder = " + item.isFolder());
    if(item.isFolder()) {
        var folder = item;
        var view = new ContentView();
        
        if(folder.customizer) {
            console.log("doing custom version");
            folder.customizer(view,folder);
        } else {
            var lv = new widgets.ListView();
            lv.setFill("#ffffff");
            view.comps.contents.add(lv);
            
            lv.setModel(item.getItems());
            lv.setTextCellRenderer(function(cell,index,item) {
                if(item == null) {
                    cell.setText("");
                } else {
                    var str = "";
                    if(item.isFolder && item.isFolder()) {
                        str += "folder: ";
                    } else {
                        str += "file: ";
                    }
                    if(item.getTitle) {
                        str += item.getTitle();
                    }
                    cell.setText(str);
                }
            });
            if(folder.onUpdate) {
                folder.onUpdate(function(doc) {
                    lv.setModel(item.getItems());
                });
            }
            
            view.comps.toolbar
                .add(new widgets.ToggleButton()
                    .setW(30).setH(20)
                    .setText("icons").setFontSize(10)
                    )
                .add(new widgets.ToggleButton()
                    .setW(30).setH(20)
                    .setText("list").setFontSize(10)
                    )
                ;
                
            view.comps.toolbar.redoLayout();
            
        }
        
        view.setFill("#ff0000");
        view.setW(400).setH(300);
        view.setTx(300).setTy(200);
          
        var winview = new WindowView();
        winview.addTab(view,folder.getTitle());
        root.add(winview);
        
        /*
        if(folder.windowx) winview.setTx(folder.windowx);
        if(folder.windowy) winview.setTy(folder.windowy);
        if(folder.windoww) winview.setW(folder.windoww);
        if(folder.windowh) winview.setH(folder.windowh);
        */
    } else {
        var view = new WindowView();
        view.setFill("#ffffff");
        var text = new widgets.TextField()
            .setText(item.doc.content);
        view.comps.contents.add(text);
        var winview = new WindowView();
        winview.addTab(view,item.getTitle());
        root.add(winview);
    }
    
    winview.setTx(100).setTy(100).setW(500).setH(300);
}

ContentView = amino.ComposeObject({
    type:"ContentView",
    extend: amino.ProtoWidget,
    comps: {
        background: {
            proto: amino.ProtoRect,
            promote: ['fill','w','h'],
        },
        contents: {
            proto: amino.ProtoGroup,
        },
        toolbar: {
            proto: widgets.HorizontalPanel,
        },
    },
    props: {
        w: {
            value: 300,
            set: function(w) {
                this.props.w = w;
                this.comps.background.setW(w);
                this.comps.toolbar.setW(w);
                this.comps.contents.children.forEach(function(ch) {
                    if(ch.setW) ch.setW(w);
                    if(ch.setTx) ch.setTx(0);
                });
                return this;
            }
        },
        h: {
            value: 300,
            set: function(h) {
                this.props.h = h;
                this.comps.background.setH(h);
                this.comps.toolbar.setH(30);
                this.comps.contents.children.forEach(function(ch) {
                    if(ch.setH) ch.setH(h-30);
                    if(ch.setTy) ch.setTy(0);
                });
                return this;
            }
        },
    },
    init: function() {
        this.comps.base.add(this.comps.background);
        this.comps.base.add(this.comps.contents);
        this.comps.base.add(this.comps.toolbar);
        this.comps.toolbar.setH(30);
        this.comps.toolbar.setGap(5).setPadding(3);
        this.comps.contents.setTy(30);
        this.children = [
            this.comps.contents, this.comps.toolbar,
        ];
    },
    
});

function splitWindow(tab, window,x,y) {
    window.comps.contents.remove(tab.content);
    window.comps.tabholder.remove(tab);
    window.layoutTabs();
    var winview = new WindowView();
    winview.setTx(x).setTy(y).setW(window.getW()).setH(window.getH());
    winview.addExistingTab(tab);
    root.add(winview);
}

function mergeWindow(tab, window, gpt) {
    tab.window.comps.contents.remove(tab.content);
    tab.window.comps.tabholder.remove(tab);
    tab.window.layoutTabs();
    if(tab.window.getTabCount() < 1) {
        tab.window.destroy();
    }
    tab.window = window;
    tab.window.addExistingTab(tab);
    root.raiseToTop(tab.window);
}

TabView = amino.ComposeObject({
    type: "Tabview",
    extend: amino.ProtoWidget,
    comps: {
        background: {
            proto: amino.ProtoRect,
            promote: ['fill'],
        },
        title: {
            proto: widgets.Label,
            promote: ['text'],
        },
        closeButton: {
            proto: widgets.PushButton,
        },
    },
    props: {
        w: {
            value: 100,
            set: function(w) {
                this.props.w = w;
                this.comps.background.setW(w);
                return this;
            }
        },
        h: {
            value: 30,
            set: function(h) {
                this.props.h = h;
                this.comps.background.setH(h);
                return this;
            }
        },
    },
    init: function() {
        this.comps.base.add(this.comps.background);
        this.comps.base.add(this.comps.title);
        this.comps.base.add(this.comps.closeButton);
        this.comps.background.setW(100);
        this.comps.background.setH(30);
        this.comps.closeButton.setW(40).setText("x").setH(20).setTx(100);
        this.comps.title.setText("foo").setTx(0);
        this.setW(140).setH(30);
        var self = this;
        var ty = 0;
        var broken = false;
        this.children = [
            this.comps.closeButton,
        ];
        
        amino.getCore().on("action",this.comps.closeButton, function(e) {
                if(self.window.getTabCount() == 1) {
                    console.log("closing window");
                    self.window.destroy();
                } else {
                    console.log("closing tab");
                    self.window.removeTab(self);
                }
        });
        amino.getCore().on("press",this,function(e) {
            self.window.raiseContentToFront(self.content);
            root.raiseToTop(self.window);
        });
        amino.getCore().on("drag",this, function(e) {
            if(broken || self.window.getTabCount() == 1) {
                //drag the whole window
                self.window.setTx(self.window.getTx()+e.dx);
                self.window.setTy(self.window.getTy()+e.dy);
                
                var pt = amino.getCore().localToGlobal(e.point,e.target);
                windowlist.forEach(function(win) {
                    var tb = win.comps.titlebar;
                    var lpt = amino.getCore().globalToLocal(pt,tb);
                    if(tb.contains(lpt.x,lpt.y) && tb != self.window.comps.titlebar) {
                        mergeWindow(self,win,pt);
                        broken = false;
                    }
                });
                return;
            } else {
                //just drag the tab
                self.setTx(self.getTx()+e.dx);
                ty += e.dy;
            }
            if(ty < -20 || ty > self.getH()+20) {
                if(self.window.getTabCount() > 1) {
                    var pt = e.point;
                    pt = amino.getCore().localToGlobal(pt,e.target);
                    splitWindow(self,self.window,pt.x,pt.y);
                    broken = true;
                }
            }
        });
        amino.getCore().on("release",this,function(e) {
            ty = 0;
            broken = false;
            self.window.layoutTabs();
        });
    },
});
WindowView = amino.ComposeObject({
    type:"WindowView",
    extend: amino.ProtoWidget,
    comps: {
        background: {
            proto: amino.ProtoRect,
            promote: ['fill'],
        },
        contents: {
            proto: amino.ProtoGroup,
        },
        titlebar: {
            proto: amino.ProtoRect,
        },
        tabholder: {
            proto: amino.ProtoGroup,
        },
        grabber: {
            proto: amino.ProtoRect,
        },
    },
    props: {
        w: {
            value: 300,
            set: function(w) {
                this.props.w = w;
                this.comps.background.setW(w);
                this.comps.titlebar.setW(w);
                this.comps.tabholder.setW(w);
                //this.comps.title.setW(w);
                //this.comps.toolbar.setW(w);
                this.comps.grabber.setTx(w-this.comps.grabber.getW());
                
                this.comps.contents.children.forEach(function(ch) {
                    if(ch.setW) ch.setW(w);
                    if(ch.setTx) ch.setTx(0);
                });
                return this;
            }
        },
        h: {
            value: 200,
            set: function(h) {
                this.props.h = h;
                this.comps.background.setH(h);
                this.comps.contents.setH(h-30);
                this.comps.tabholder.setH(30);
                var g = this.comps.grabber;
                g.setTy(h-g.getH());
                
                this.comps.contents.children.forEach(function(ch) {
                    if(ch.setH) ch.setH(h-30);
                    if(ch.setTy) ch.setTy(0);
                });
                
                return this;
            }
        },
        
        draggable: {
            value: true,
        },
        
        resizable: {
            value: true,
            set: function(resizable) {
                this.props.resizable = resizable;
                this.comps.grabber.setVisible(resizable);
                return this;
            }
        },
    },
    init: function() {
        this.comps.base.add(this.comps.background);
        this.comps.base.add(this.comps.contents);
        this.comps.base.add(this.comps.grabber);
        this.comps.base.add(this.comps.titlebar);
        this.comps.base.add(this.comps.tabholder);
        
        this.comps.background.setFill("#eeeeee");
        this.comps.contents.setTy(30);
        
        this.comps.titlebar.setW(100).setH(30).setFill("#ccccff");
        this.comps.grabber.setW(30).setH(30).setFill("#555555");
        
        var self = this;
        amino.getCore().on("drag",this.comps.grabber,function(e) {
            self.setW(self.getW()+e.dx);
            self.setH(self.getH()+e.dy);
        });
        
        amino.getCore().on("press",this.comps.titlebar, function(e) {
            if(!self.getDraggable()) return;
            self.parent.raiseToTop(self);
        });
        amino.getCore().on("drag",this.comps.titlebar, function(e) {
            if(!self.getDraggable()) return;
            self.setTx(self.getTx()+e.dx);
            self.setTy(self.getTy()+e.dy);
        });
        

        this.contains = undefined;
        this.children = [
            this.comps.background,
            this.comps.contents, 
            this.comps.titlebar,
            this.comps.tabholder, 
            this.comps.grabber,
        ];
        
        this.addTab = function(view, title) {
            this.comps.contents.add(view);
            var count = this.comps.tabholder.children.length;
            var tab = new TabView().setText(title).setTx(count*150);
            tab.window = this;
            tab.content = view;
            this.comps.tabholder.add(tab);
            tab.setTx(count*150);
        };
        
        this.addExistingTab = function(tab) {
            this.comps.contents.add(tab.content);
            var count = this.comps.tabholder.children.length;
            tab.window = this;
            this.comps.tabholder.add(tab);
            tab.setTx(count*150);
        }
        
        this.layoutTabs = function() {
            //re-sort them by tx
            var arr = [];
            this.comps.tabholder.children.forEach(function(tab) {
                arr[tab.getTx()] = tab;
            });
            //layout again in the new order
            var tx = 0;
            arr.forEach(function(tab) {
                tab.setTx(tx);
                tx+= 150;
            });
        }
        
        this.getTabCount = function() {
            return this.comps.tabholder.children.length;
        }
        windowlist.push(this);        
        
        this.destroy = function() {
            root.remove(this);
            var n = windowlist.indexOf(this);
            windowlist.splice(n,1);
        }
        
        this.removeTab = function(tab) {
            this.comps.contents.remove(tab.content);
            this.comps.tabholder.remove(tab);
            this.layoutTabs();
        }
        
        this.raiseContentToFront = function(content) {
            this.comps.contents.raiseToTop(content);
        }
    }
});



function DocumentItem(doc) {
    this.title = doc.title;
    this.doc = doc;
    this.type = 'generic';
    this.getTitle = function() { return this.title; }
    this.isFolder = function() { return false; }
    this.getType  = function() { return this.type; }
    return this;
}

function TextDocumentItem(title,contents) {
    this.title    = title;
    this.contents = contents;
    this.type     = 'text';
    this.getTitle = function() { return this.title; }
    this.isFolder = function() { return false; }
    this.getType  = function() { return this.type; }
    return this;
}

function DocumentQueryFolder(title,doctype,customizer) {
    this.title = title;
    this.customizer = null;
    if(customizer) this.customizer = customizer;
    console.log("adding a monitor");
    var self = this;
    db.monitor({doctype:doctypes.email, action:"insert"}, function(db,data) {
        var count = db.query({doctype:doctypes.email}).length;
        console.log("total email count is now: " + count);
        if(self.cb) self.cb(data);
    });
    
    this.getTitle = function() { return this.title; }
    this.isFolder = function() { return true; }
    this.getItems = function() { 
        var items = [];
        db.query({doctype:doctype}).forEach(function(doc) {
            items.push(new DocumentItem(doc));
        });
        return items; 
    }
    this.onUpdate = function(cb) {
        this.cb = cb;
    }
}

var EmailListViewCell = amino.ComposeObject({
    type: "EmailListViewCell",
    extend: amino.ProtoWidget,
    comps: {
        background: {
            proto: amino.ProtoRect,
            promote: ['w','h','fill'],
        },
        line: {
            proto: amino.ProtoRect,
        },
        from: {
            proto: amino.ProtoText,
        },
        subject: {
            proto: amino.ProtoText,
        },
        desc: {
            proto: amino.ProtoText,
        },
    },
    init: function() {
        this.comps.base.add(this.comps.background);
        this.comps.base.add(this.comps.line);
        
        this.comps.from.setText("from")
            .setFill("#3498db")
            .setFontWeight(600)
            .setTx(8).setTy(22)
            .setFontSize(15);
        this.comps.base.add(this.comps.from);

        this.comps.subject.setText("subject")
            .setTx(8).setTy(42)
            .setFontSize(15);
        this.comps.base.add(this.comps.subject);
        
        this.comps.desc.setText("desc")
            .setTx(8).setTy(64)
            .setFontWeight(200)
            .setFontSize(15);
        this.comps.base.add(this.comps.desc);
    },
});

var SongListViewCell = amino.ComposeObject({
    type:"SongListViewCell",
    extend: amino.ProtoWidget,
    comps: {
        background: {
            proto: amino.ProtoRect,
            promote: ['w','h','fill'],
        },
        title: {
            proto: amino.ProtoText,
        },
        artist: {
            proto: amino.ProtoText,
        },
        album: {
            proto: amino.ProtoText,
        },
        play: {
            proto: widgets.PushButton,
        },
    },
    init: function() {
        this.comps.base.add(this.comps.background);
        this.comps.base.add(this.comps.title);
        this.comps.base.add(this.comps.artist);
        this.comps.base.add(this.comps.album);
        this.comps.base.add(this.comps.play);
        this.comps.title.setTx(0).setTy(20).setFontSize(15);
        this.comps.artist.setTx(100).setTy(20).setFontSize(15);
        this.comps.album.setTx(200).setTy(20).setFontSize(15);
        this.comps.play.setTx(300).setTy(5).setW(40).setH(20).setText("play");
    },
});

function EmailViewCustomizer(view,folder) {
    var lv = new widgets.ListView()
        .setFill("#ffffff")
        .setCellHeight(80)
        ;
    view.comps.contents.add(lv);
    
    lv.setModel(folder.getItems());
    lv.setCellGenerator(function() { return new EmailListViewCell(); });
    
    lv.setTextCellRenderer(function(cell,index,item) {
        if(item == null) return;
        cell.comps.from.setText(item.from);
        cell.comps.subject.setText(item.doc.subject.substring(0,30));
        cell.comps.desc.setText(item.doc.body.substring(0,50));
        cell.comps.background.setFill("#fffffa");
        cell.comps.line.setFill("#f1ebeb");
        cell.comps.line.setH(1);
        cell.comps.line.setW(cell.getW());
        //cell.setText(email.doc.from + " : " + email.doc.subject);
        //console.log(email);
    });
    if(folder.onUpdate) {
        folder.onUpdate(function(doc) {
            lv.setModel(folder.getItems());
        });
    }


    view.comps.toolbar
        .add(new widgets.PushButton().setW(30).setH(30).setFontSize(20).setFontName('awesome')
            .setText("\uf112").onAction(function(e) {
            }))
        .add(new widgets.PushButton().setW(30).setH(30).setFontSize(20).setFontName('awesome')
            .setText("\uf044").onAction(function(e) {
            }))
        ;
    view.comps.toolbar.redoLayout();
}


function MusicViewCustomizer(view,folder) {
    var lv = new widgets.ListView().setFill("#ffffff");
    view.comps.contents.add(lv);
    lv.setModel(folder.getItems());
    lv.setCellGenerator(function() { return new SongListViewCell(); });
    lv.setTextCellRenderer(function(cell,index,item) {
        if(item == null) return;
        cell.comps.title.setText(item.doc.title);
        cell.comps.artist.setText(item.doc.artist);
        cell.comps.album.setText(item.doc.album);
    });
    if(folder.onUpdate) {
        folder.onUpdate(function(doc) {
            lv.setModel(folder.getItems());
        });
    }


    view.comps.toolbar
        .add(
            new widgets.PushButton().setW(30).setH(20).setFontSize(20).setFontName('awesome')
            .setText('\uf04a').onAction(function(e) {
            }))
        .add(
            new widgets.PushButton().setW(30).setH(20).setFontSize(20).setFontName('awesome')
            .setText('\uf04b').onAction(function(e) {
            }))
        .add(
            new widgets.PushButton().setW(30).setH(20).setFontSize(20).setFontName('awesome')
            .setText('\uf04e').onAction(function(e) {
            }))
        ;
    view.comps.toolbar.redoLayout();
}

function DesktopFolder() {
    this.title = "desktop";
    this.getTitle = function() { return this.title; }
    this.items = [
        new DocumentQueryFolder("All Email",doctypes.email),
        new DocumentQueryFolder("Inbox", doctypes.email, EmailViewCustomizer),
        new DocumentQueryFolder("All Music", doctypes.song),
        new DocumentQueryFolder("Music", doctypes.song, MusicViewCustomizer),
        new DocumentQueryFolder("All Text",doctypes.text),
        new DocumentQueryFolder("Contacts", doctypes.person),
    ];

    var items = this.items;    
    db.query({doctype:doctypes.text}).forEach(function(doc) {
        items.push(new DocumentItem(doc));
    });
    this.getItems = function() { return this.items; }
}

amino.startApp(function(core, stage) {
    stage.setSize(1000,700);
    var desktopfolder = new DesktopFolder();
    var music = desktopfolder.items[0];
    music.windowx = 100;
    music.windowy = 150;
    music.windoww = 300;
    music.windowh = 300;
        
    root = new amino.ProtoGroup();
    stage.setRoot(root);
    
    var desktopview = new WindowView()
        .setId("desktop")
        .setW(1000).setH(700)
        .setDraggable(false)
        .setResizable(false)
        ;
    amino.getCore().on("windowsize",stage,function(size) {
        console.log(size.width,size.height);
    });
    var items = desktopfolder.getItems();
    for(var i=0; i<items.length; i++) {
        var item = items[i];
        desktopview.comps.contents.add(new IconView()
                .setTx(i*85+5).setTy(5)
                .setW(80).setH(80)
                .setText(item.getTitle())
                .setFill(item.isFolder()?"#cc8888":"#8888cc")
                .setItem(item)
        );
    }
    //desktopview.comps.title.setText("desktop");
    root.add(desktopview);
    
    
    var fakeNewEmail = new widgets.PushButton().setText("Receive Email")
        .setW(110).setH(30).setTx(800).setTy(50);
    fakeNewEmail.onAction(function(e) {
        db.insert({doctype:doctypes.email, doc: {
            title:"an new email ",
            from: "foo@bar.com",
            to: "bar@foo.com",
            subject:"Subjects are for the weak!"+Math.floor(Math.random()*100),
            body: "Hah. You read the message! Foolish mortal.",
        }});
        
    });
    root.add(fakeNewEmail);
    
    
    setInterval(function() {
        //console.log("============");
        //console.log("processing database updates");
        db.processUpdates();
    },100);
    
});