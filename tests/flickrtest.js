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
var trans = new SlideRightTransition(grid,panel);

stage.on("SELECT",grid, function() {
    console.log("selecting it");
    trans.push();
});
stage.on("PRESS",panel, function() {
    trans.pop();
});

core.started = false;
var setupTextures = function() {
    core.started = true;
    doSearch("cat");
}





setTimeout(function(){
    core.start();
    setupTextures();
},1000);
