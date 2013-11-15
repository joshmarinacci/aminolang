var amino = require('amino.js');
var widgets = require('widgets.js');
var db = require('../phone/database').makeDB();
var Global = require('./Global.js');
var Email = require('./Email.js');
var WindowView = require('./WindowView.js');
var IconView = require('./IconView.js');
var Music = require('./Music.js');
var Contacts = require('./Contacts.js');
var Twitter = require('./Twitter.js');
var fs = require('fs');
var ChatApp = require('./ChatApp.js');
var SettingsApp = require('./Settings.js');
var ContentView = require('./ContentView.js');
var OSStatus = require('./OSStatus.js');
var os = require('os');

var util = require('util');
var twitter = require('twitter');


amino.colortheme.base = "#dddddd";

var doctypes = {
    email:   'com.joshondesign.aminos.email.message',
    photo:   'com.joshondesign.aminos.photo.jpeg',
    song:    'com.joshondesign.aminos.music.song',
    text:    'com.joshondesign.aminos.text.plain',
    person:  'com.joshondesign.aminos.contacts.person',
    tweet:   'com.joshondesign.aminos.twitter.tweet',
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

function parseFile(filename) {
    var docs = JSON.parse(fs.readFileSync(filename)).documents;
    console.log(docs);
    docs.forEach(function(meta) {
        meta.doc.file = "DesktopDB/Music/"+meta.doc.file;
        db.insert({doctype:meta.type, doc: meta.doc});
    });
}
parseFile("DesktopDB/Music/songs.json");
parseFile("DesktopDB/Contacts/contacts.json");
parseFile("DesktopDB/Documents/documents.json");
parseFile("DesktopDB/Photos/photos.json");


var apps = [
    {
        title: "Chat",
        init: ChatApp.buildApp,
    },
    {
        title: "Settings",
        init: SettingsApp.buildApp,
    },
    {
        title: "Twitter",
        init: function() {
            return new DocumentQueryFolder("Twitter", doctypes.tweet, Twitter.ConnectViewCustomizer);
        },
    },
    {
        title: "Email",
        init: function() {
            return new DocumentQueryFolder("Inbox", doctypes.email, Email.EmailViewCustomizer);
        },
    },
    {
        title: "Music",
        init: function() {
            return new DocumentQueryFolder("Music", doctypes.song, Music.MusicViewCustomizer);
        },
    },
    {
        title: "Geometry",
        init: function() {
            var poly = new amino.ProtoPoly();
            var cos = function(th) {
                return Math.cos(th/180.0*Math.PI);
            }
            var sin = function(th) {
                return Math.sin(th/180.0*Math.PI);
            }
            
            var points = [];
            for(var i=0; i<360*2; i+=2) {
                points.push(cos(i*5)*100);
                points.push(sin(i*7)*100);
                points.push(cos(i)*100);
            }
            poly.setGeometry(points);
            poly.setDimension(3);
            poly.setTx(200).setTy(200);
            
            amino.getCore().createPropAnim(poly,"rotateY",0,360,10000)
            .setCount(-1);
            var panel = new widgets.AnchorPanel();
            panel.setFill("#555555");
            panel.isApp = function() { return true; }
            panel.getTitle = function() { return "Geometry"; }
            panel.add(poly);
            panel.setW(600).setH(600);
            return panel;
        },
    },
    {
        title: "New Text Doc",
        init: function() {
            return new TextDocumentItem("foo",{
                    title:"footitle",
                  content:"asdf",
            });
        },
    },
];

/*
var consumer_key = "hva7MBAIH8VA93HFeVMNg";
var consumer_secret = "m2fwhKqoQJK90MY7IK4Z01ct5bG0S4I9ergj0pHw7c";
var access_token = "8559252-r1FVHjOf7bT9ZXJfklOKFxA6UDuapFvgXmcfjeGUsW";
var access_secret = "5274r6RwpNILFWjdilYeIHsw433kJZTsw5ByuLxZemWCa";
var twit = new twitter({
        consumer_key: consumer_key,
        consumer_secret: consumer_secret,
        access_token_key: access_token,
        access_token_secret: access_secret,
});
twit
  .verifyCredentials(function (err, data) {
    console.log(data);
    twit.get('/statuses/mentions_timeline.json',{
            count: 5,
            trim_user:true,
        },function(data) {
        data.forEach(function(tweet) {
            console.log("inserting: " + tweet.text);
            db.insert({doctype:doctypes.tweet, doc: {
                title: tweet.text,
                content:tweet,
            }});
        });
    });
  })

*/

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
    this.doc = contents;
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
        new DocumentQueryFolder("All Photos", doctypes.photo),
        new DocumentQueryFolder("All Music", doctypes.song),
        //new DocumentQueryFolder("Music", doctypes.song, Music.MusicViewCustomizer),
        new DocumentQueryFolder("All Text",doctypes.text),
        new DocumentQueryFolder("Contacts", doctypes.person, Contacts.ContactsViewCustomizer),
        //new DocumentQueryFolder("Twitter", doctypes.tweet, Twitter.ConnectViewCustomizer),
    ];

    var items = this.items;    
    db.query({doctype:doctypes.text}).forEach(function(doc) {
        items.push(new DocumentItem(doc));
    });
    this.getItems = function() { return this.items; }
}


function setupDock(core,stage) {
    var dock = new widgets.VerticalPanel();
    dock.setFill("#ccffcc");
    dock.setW(150).setH(500);
    
    OSStatus.buildApp(dock);
    
    var fakeNewEmail = new widgets.PushButton().setText("Receive Email")
        .setW(110).setH(30).setTx(5).setTy(150);
    fakeNewEmail.onAction(function(e) {
        db.insert({doctype:doctypes.email, doc: {
            title:"an new email ",
            from: "foo@bar.com",
            to: "bar@foo.com",
            subject:"Subjects are for the weak!"+Math.floor(Math.random()*100),
            body: "Hah. You read the message! Foolish mortal.",
        }});
        
    });
    dock.add(fakeNewEmail);
    
    
    var dy = 150;
    apps.forEach(function(app) {
        dy+= 5;
        dy+= 30;
        var button = new widgets.PushButton().setText(app.title)
            .setW(110).setH(30).setTx(5).setTy(dy);
        button.onAction(function(e) {
            var ap = app.init(core,stage,db);
            Global.openView(ap);
        });
        dock.add(button);
    });
    
    return dock;
}

amino.startApp(function(core, stage) {
    var root;
    stage.setSize(1200,600);
    
    console.log('stage size = ' + stage.getW() + " " + stage.getH());
    var desktopfolder = new DesktopFolder();
    var music = desktopfolder.items[0];
    music.windowx = 100;
    music.windowy = 150;
    music.windoww = 300;
    music.windowh = 300;
        
    root = new amino.ProtoGroup().setId("root");
    stage.setRoot(root);
    
    var desktopview = new WindowView.WindowView()
        .setId("desktop")
        .setW(stage.getW()-155).setH(stage.getH())
        .setTx(155)
        .setDraggable(false)
        .setResizable(false)
        ;
    
    var items = desktopfolder.getItems();
    var cv = new amino.ProtoGroup();
    for(var i=0; i<items.length; i++) {
        var item = items[i];
        cv.add(new IconView.IconView()
                .setTx(i*85+5).setTy(5)
                .setW(80).setH(80)
                .setText(item.getTitle())
                .setFill(item.isFolder()?"#cc8888":"#8888cc")
                .setItem(item)
        );
    }
    desktopview.comps.contents.add(cv);
    //desktopview.comps.title.setText("desktop");
    var desktopbg = new amino.ProtoImageView().setSrc("DesktopDB/Photos/saturn.jpg");
    root.add(desktopbg);
    root.add(desktopview);
    desktopview.comps.border.setVisible(false);
    desktopview.comps.background.setVisible(false);
    
    
    Global.windows = new amino.ProtoGroup().setId("WindowsGroup");
    root.add(Global.windows);
    
    
    root.add(setupDock(core,stage));
    
    setInterval(function() {
        db.processUpdates();
    },100);


//    var cursor = new amino.ProtoRect().setW(10).setH(10).setFill("#e0e0e0");
    var cursor = new amino.ProtoText().setFontName('awesome').setText('\uF124').setFill("#ffffff");
    root.add(cursor);
    core.on("move",null,function(e) {
        cursor.setTx(e.x+1);
        cursor.setTy(e.y+1);
    });
    
});
