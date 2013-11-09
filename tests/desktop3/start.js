var amino = require('../../build/desktop/amino.js');
var widgets = require('../../build/desktop/widgets.js');
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
var os = require('os');

var util = require('util');
var twitter = require('twitter');


amino.colortheme.base = "#dddddd";

var doctypes = {
    email:   'com.joshondesign.aminos.email.message',
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

console.log("parsing the on disk database");
var docs = JSON.parse(fs.readFileSync("DesktopDB/Music/songs.json")).documents;
console.log(docs);
docs.forEach(function(meta) {
    meta.doc.file = "DesktopDB/Music/"+meta.doc.file;
    db.insert({doctype:meta.type, doc: meta.doc});
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
        //new DocumentQueryFolder("Inbox", doctypes.email, Email.EmailViewCustomizer),
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
        
    root = new amino.ProtoGroup();
    stage.setRoot(root);
//    Global.root = root;
    
    var desktopview = new WindowView.WindowView()
        .setId("desktop")
        .setW(stage.getW()).setH(stage.getH())
        .setDraggable(false)
        .setResizable(false)
        ;
        /*
    amino.getCore().on("windowsize",stage,function(size) {
        console.log(size.width,size.height);
    });
    */
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
    
    
    Global.windows = new amino.ProtoGroup();
    root.add(Global.windows);
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
    root.add(fakeNewEmail);
    
    
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
        root.add(button);
    });
    
    setInterval(function() {
        db.processUpdates();
    },100);


    var cursor = new amino.ProtoRect().setW(10).setH(10).setFill("#e0e0e0");
//    var cursor = new amino.ProtoText().setFontName('awesome').setText('\uF124').setFill("#ffffff");
    root.add(cursor);
    core.on("move",null,function(e) {
        cursor.setTx(e.x+1);
        cursor.setTy(e.y+1);
    });
    
    setInterval(function() {
        console.log(util.inspect(process.memoryUsage()));
        console.log(util.inspect(os.cpus()[0]));
    },2000);
});
