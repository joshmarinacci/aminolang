var fs = require('fs');
var amino = require('../src/node/amino.js');

var Feedr = require('feedr').Feedr;
var feedr = new Feedr();

var feeds = {
    flickr: {
        url:"http://api.flickr.com/services/feeds/photos_public.gne?id=31706743@N00&lang=en-us&format=rss_200"
    }
};

var thumbs = [];
feedr.readFeeds(feeds, function(err, result) {
    var data = result.flickr.rss.channel[0].item;
    for(var i=0; i<data.length; i++) {
        var item = data[i]
        var thumb = item["media:thumbnail"][0]["$"];
        console.log("photo " + item.title /* + " at " + item.link*/ + " with thumb: ", thumb.url + " size = " + thumb.width + "x" + thumb.height);
        thumbs.push(thumb);
    }
});

var core = amino.getCore();
core.setDevice("mac");
var stage = core.createStage();
var root = core.createGroup();
stage.setRoot(root);


var search = core.createTextbox();
search.setW(300).setText("foo").setTx(2).setTy(2);
root.add(search);

var label = core.createLabel();
label.setTextColor(new amino.Color(1,1,1));
label.setFontSize(20);
label.setTx(2).setTy(40).setText("a label");
root.add(label);


var grid = core.createListView();
grid.listModel = [];
grid.setW(75*3).setH(300).setTy(100);
grid.DEBUG = true;
grid.cellHeight = 75;
grid.cellWidth = 75;
grid.layout = "horizwrap";
grid.listModel = thumbs;
grid.cellRenderer = function(gfx, item, bounds) {
    gfx.fillQuadColor(new amino.Color(0.5,0.5,0.5), bounds);
    if(item.texid) {
        gfx.fillQuadTexture(item.texid,bounds.x,bounds.y,75,75);
    }
}
root.add(grid);


var setupTextures = function() {
    function createThumbTexture(th) {
        stage.loadRemoteTexture(th.url, th.width, th.height, function(id) {
            th.texid = id;
        });
    }
    for(var i=0; i<thumbs.length; i++) {
        var th = thumbs[i];
        if(!th) continue;
        createThumbTexture(th);
    }
}





setTimeout(function(){
    core.start();
    setupTextures();
},1000);
