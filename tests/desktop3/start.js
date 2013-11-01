var amino = require('../../build/desktop/amino.js');
var widgets = require('../../build/desktop/widgets.js');
var db = require('../phone/database').makeDB();
var Global = require('./Global.js');
var Email = require('./Email.js');
var WindowView = require('./WindowView.js');
var IconView = require('./IconView.js');
var Music = require('./Music.js');
var fs = require('fs');


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

var files = fs.readdirSync("Resources");
files.forEach(function(file) {
    if(file.toLowerCase().endsWith('.mp3')) {
        db.insert({doctype:doctypes.song, doc: {
            title: file,
            artist: "Unknown",
            album: "Unknown",
            file: "Resources/"+file,
        }});
        console.log(file);
    }
});

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
//        console.log("total email count is now: " + count);
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
        new DocumentQueryFolder("All Email",doctypes.email),
        new DocumentQueryFolder("Inbox", doctypes.email, Email.EmailViewCustomizer),
        new DocumentQueryFolder("All Music", doctypes.song),
        new DocumentQueryFolder("Music", doctypes.song, Music.MusicViewCustomizer),
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
    
    var desktopview = new WindowView.WindowView()
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
        desktopview.comps.contents.add(new IconView.IconView()
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
