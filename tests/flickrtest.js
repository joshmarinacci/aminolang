var fs = require('fs');
var amino = require('../src/node/amino.js');

var Feedr = require('feedr').Feedr;
var feedr = new Feedr();


function createThumbTexture(th) {
    if(!th) return;
    if(!core) return;
    if(!core.started) return;
    console.log("loading thumb: " + th.url);
    stage.loadRemoteTexture(th.url, th.width, th.height, function(id) {
        th.texid = id;
    });
}



var core = amino.getCore();
core.setDevice("mac");
var stage = core.createStage();
var root = core.createGroup();
stage.setRoot(root);
var grid = core.createListView();
grid.listModel = [];

function doSearch(keyword) {
    console.log("doSearch: " + keyword);
    grid.listModel = [];
    var feeds = {
        flickr: {
            url:"http://api.flickr.com/services/feeds/photos_public.gne?format=rss_200&tags="+keyword
        }
    };
    
    feedr.readFeeds(feeds, function(err, result) {
        var data = result.flickr.rss.channel[0].item;
        for(var i=0; i<data.length; i++) {
            var item = data[i]
            var thumb = item["media:thumbnail"][0]["$"];
            grid.listModel.push(thumb);
            createThumbTexture(thumb);
        }
    });
}

var search = core.createTextbox();
search.setW(300).setText("foo").setTx(2).setTy(2);
root.add(search);
stage.on("action",search,function() {
    doSearch(search.getText());
});

var label = core.createLabel();
label.setTextColor(new amino.Color(1,1,1));
label.setFontSize(20);
label.setTx(2).setTy(40).setText("a label");
root.add(label);


grid.setW(75*3).setH(300).setTy(100);
grid.DEBUG = true;
grid.cellHeight = 75;
grid.cellWidth = 75;
grid.layout = "horizwrap";
grid.cellRenderer = function(gfx, item, bounds) {
    gfx.fillQuadColor(new amino.Color(0.5,0.5,0.5), bounds);
    if(item.texid) {
        gfx.fillQuadTexture(item.texid,bounds.x,bounds.y,75,75);
    }
}
root.add(grid);


var panel = core.createAnchorPanel();
panel.setW(400).setH(400).setTx(400);
root.add(panel);


function SlideRightTransition(src, dst) {
    this.src = src;
    this.dst = dst;
    var self = this;
    this.push = function() {
        stage.addAnim(amino.anim(this.src,"tx",0,-400,250));
        stage.addAnim(amino.anim(this.dst,"tx",400,0,250));
    }
    this.pop = function() {
        stage.addAnim(amino.anim(this.src,"tx",-400,0,250));
        stage.addAnim(amino.anim(this.dst,"tx",0,400,250));
    }
}


function NavigationManager() {
    this.panels = [];
    this.register = function(panel) {
        this.panels.push(panel);
    }
    this.transitions = {};
    this.createTransition = function(name,src,dst,type) {
        this.transitions[name] = {
            name:name,
            src:src,
            dst:dst,
            type:type
        };
    }
    this.navstack = [];
    this.push = function(name) {
        var trans = this.transitions[name];
        stage.addAnim(amino.anim(trans.src, "tx", 0, -400, 250));
        stage.addAnim(amino.anim(trans.dst, "tx", 400,  0, 250));
        this.navstack.push(trans);
    }
    this.pop = function() {
        var trans = this.navstack.pop();
        stage.addAnim(amino.anim(trans.src, "tx", -400, 0, 250));
        stage.addAnim(amino.anim(trans.dst, "tx", 0,  400, 250));
    }
}

var nav = new NavigationManager();
nav.register(grid);
nav.register(panel);
nav.createTransition("fullview",grid,panel,"slideright");

stage.on("SELECT", grid,  function() { nav.push("fullview"); });
stage.on("PRESS",  panel, function() { nav.pop(); });



var searchButton  =  core.createToggleButton();
searchButton
    .setText("Search")
    .setTx(3).setTy(500)
    .setW(100).setH(40);
root.add(searchButton);

var uploadButton = core.createToggleButton()
    .setText("Upload").setTx(110).setTy(500).setW(100).setH(40);
root.add(uploadButton);

var cameraButton = core.createToggleButton()
    .setText("Camera").setTx(220).setTy(500).setW(100).setH(40);
root.add(cameraButton);


var fullView = core.createImageView();
fullView.setW(300).setH(300);
fullView.iw = 300;
fullView.ih = 300;
//fullView.setUrl("http://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Mona_Lisa.jpg/396px-Mona_Lisa.jpg");
//fullView.setUrl("http://farm9.staticflickr.com/8386/8682730192_701bfa9614_s.jpg");
panel.add(fullView);


core.started = false;
var setupTextures = function() {
    core.started = true;
    doSearch("cat");
}


stage.on("WINDOWSIZE", stage, function(e) {
    search.setW(e.width-10);
});


setTimeout(function(){
    core.start();
    setupTextures();
},1000);
