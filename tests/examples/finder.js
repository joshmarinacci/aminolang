var amino = require('../../build/desktop/amino.js');
var widgets = require('../../build/desktop/widgets.js');


var db = require('../phone/database').makeDB();

var doctypes = {
    email: "com.joshondesign.aminos.email.message",
    song: "com.joshondesign.aminos.music.song",
    
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
    console.log("opening a view for the item: ", item);
    console.log("folder = " + item.isFolder());
    if(item.isFolder()) {
        var view = new WindowView();
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
        
        view.setFill("#ff0000");
        view.setW(400).setH(300);
        view.setTx(300).setTy(200);
        var folder = item;
        view.comps.title.setText(folder.getTitle());
        if(folder.windowx) view.setTx(folder.windowx);
        if(folder.windowy) view.setTy(folder.windowy);
        if(folder.windoww) view.setW(folder.windoww);
        if(folder.windowh) view.setH(folder.windowh);
        view.comps.toolbar
            .add(new widgets.ToggleButton()
                .setW(30).setH(20)
                .setText("icons").setFontSize(10)
                )
            .add(new widgets.ToggleButton()
                .setW(30).setH(20)
                .setText("list").setFontSize(10)
                )
            .add(new widgets.PushButton()
                .setW(30).setH(20)
                .setText("close").setFontSize(10)
                .onAction(function(e) {
                    view.setVisible(false);
                })
                )
            ;
        view.comps.toolbar.redoLayout();
            
        root.add(view);
        
        if(folder.onUpdate) {
            folder.onUpdate(function(doc) {
                lv.setModel(item.getItems());
            });
        }
    } else {
        var view = new WindowView();
        view.setFill("#ffffff");
        view.comps.toolbar
            .add(new widgets.PushButton()
                .setW(30).setH(20)
                .setText("close").setFontSize(10)
                .onAction(function(e) {
                    view.setVisible(false);
                })
                );

        var label = new widgets.Label()
            .setText(item.getTitle())
            .setFontSize(40);
        view.comps.contents.add(label);
        view.setW(400).setH(300);
        view.setTx(300).setTy(200);
        root.add(view);
    }
}

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
        toolbar: {
            proto: widgets.HorizontalPanel,
        },
        title: {
            proto: widgets.Label,
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
                this.comps.title.setW(w);
                this.comps.toolbar.setW(w);
                this.comps.grabber.setTx(w-this.comps.grabber.getW());
                this.comps.contents.children.forEach(function(ch) {
                    if(ch.setW) ch.setW(w);
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
        this.comps.base.add(this.comps.toolbar);
        this.comps.base.add(this.comps.title);
        
        this.comps.background.setFill("#eeeeee");
        this.comps.contents.setTy(30);
        
        this.comps.titlebar.setW(100).setH(30).setFill("#cccccc");
        this.comps.toolbar.setW(100).setH(30).setGap(2).setPadding(2);
        this.comps.title.setAlign("center").setTy(3);
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
            this.comps.toolbar, 
            this.comps.grabber,
            
        ];
    }
});



function DocumentItem(doc) {
    this.title = doc.title;
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

function SongDocumentItem(title,artist,album) {
    this.title    = title;
    this.artist   = artist;
    this.album    = album;
    this.type     = 'song';
    this.getTitle = function() { return this.title; }
    this.isFolder = function() { return false; }
    return this;
}


function MusicFolder() {
    this.title = "music";
    var items = [];
    db.query({doctype:doctypes.song}).forEach(function(song) {
        items.push(new SongDocumentItem(
            song.title,
            song.artist,
            song.album));
    });
    
    this.getTitle = function() { return this.title; }
    this.isFolder = function() { return true; }
    this.getItems = function() { return items; }
}

function DocumentQueryFolder(title,doctype) {
    this.title = title;
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

function DesktopFolder() {
    this.title = "desktop";
    this.getTitle = function() { return this.title; }
    this.items = [
        new MusicFolder(),
        new TextDocumentItem('foo.txt',"some foo text"),
        new TextDocumentItem('bar.txt',"some bar text"),
        new DocumentQueryFolder("All Email",doctypes.email),
    ];
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
    desktopview.comps.title.setText("desktop");
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