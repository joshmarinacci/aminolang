var amino = require('../../build/desktop/amino.js');
var widgets = require('../../build/desktop/widgets.js');

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
    init: function() {
        this.comps.base.add(this.comps.background);
        this.comps.base.add(this.comps.title);
    }
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
            proto: widgets.ListView,
        },
        icons: {
            proto: amino.ProtoGroup,
        },
        titlebar: {
            proto: amino.ProtoRect,
        },
        switchicons: {
            proto: widgets.ToggleButton,
        },
        switchlist: {
            proto: widgets.ToggleButton,
        },
        close: {
            proto: widgets.PushButton,
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
                this.comps.grabber.setTx(w-this.comps.grabber.getW());
                this.comps.contents.setW(w);
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
                return this;
            }
        },
        folder: {
            value: null,
            set: function(folder) {
                this.props.folder = folder;
                if(folder != null) {
                    this.comps.title.setText(folder.getTitle());
                    if(folder.windowtx) this.setTx(folder.windowtx);
                    if(folder.windowty) this.setTy(folder.windowty);
                    if(folder.windoww) this.setW(folder.windoww);
                    if(folder.windowh) this.setH(folder.windowh);
                }
                this.regenCells();
                return this;
            }
        },
        mode: {
            value: "list",
            set: function(mode) {
                this.props.mode = mode;
                if(mode == "list") {
                    this.comps.contents.setVisible(true);
                    this.comps.icons.setVisible(false);
                } else {
                    this.comps.contents.setVisible(false);
                    this.comps.icons.setVisible(true);
                }
                return this;
            }
        },
        
        draggable: {
            value: true,
        },
        
        resizable: {
            value: true,
        },
    },
    init: function() {
        this.comps.base.add(this.comps.background);
        this.comps.base.add(this.comps.contents);
        this.comps.base.add(this.comps.icons);
        this.comps.base.add(this.comps.grabber);
        this.comps.base.add(this.comps.titlebar);
        
        this.comps.base.add(this.comps.switchicons);
        this.comps.base.add(this.comps.switchlist);
        this.comps.base.add(this.comps.close);
        this.comps.base.add(this.comps.title);
        
        
        
        this.comps.background.setFill("#eeeeee");
        this.comps.icons.setTy(30);
        
        this.comps.switchicons.setTx(5).setTy(5).setW(30).setH(20).setText("icons").setFontSize(10);
        this.comps.switchlist.setTx(40).setTy(5).setW(30).setH(20).setText("list").setFontSize(10);
        this.comps.close.setTx(75).setTy(5).setW(30).setH(20).setText("close").setFontSize(10);
        
        
        this.comps.titlebar.setW(100).setH(30).setFill("#cccccc");
        this.comps.title.setAlign("center").setTy(3);
        this.comps.grabber.setW(30).setH(30).setFill("#555555");
        this.comps.contents.setTy(30).setFill("#dddddd");
        this.comps.contents.setTextCellRenderer(function(cell,index,item) {
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
        
        var self = this;
        amino.getCore().on("drag",this.comps.grabber,function(e) {
            self.setW(self.getW()+e.dx);
            self.setH(self.getH()+e.dy);
        });
        
        amino.getCore().on("drag",this.comps.titlebar, function(e) {
            if(!self.getDraggable()) return;
            self.setTx(self.getTx()+e.dx);
            self.setTy(self.getTy()+e.dy);
        });
        
        amino.getCore().on("action", this.comps.close, function(e) {
            self.setVisible(false);
        });
        
        this.regenCells = function() {
            var items = this.getFolder().getItems();
            this.comps.contents.setModel(items);
            for(var i=0; i<items.length; i++) {
                var item = items[i];
                this.comps.icons.add(new IconView()
                    .setTx(i*60+5).setTy(5)
                    .setW(50).setH(50)
                    .setText(item.getTitle())
                    .setFill(item.isFolder()?"#cc8888":"#8888cc")
                    );
            }
            
            
        }
        
        this.layoutCells = function() {
            for(var i=0; i<this.comps.cells.children.length; i++) {
                var cell = this.comps.cells.children[i];
                cell.setTx(i*60);
            }
        }
        
        this.contains = undefined;
        this.children = [this.comps.background, this.comps.titlebar, this.comps.grabber, this.comps.switchlist, this.comps.switchicons, this.comps.close];
    }
});

function FolderItem(title) {
    this.title = title;
    this.getTitle = function() { return this.title; }
    this.isFolder = function() { return false; }
    return this;
}

function MusicFolder() {
    this.title = "music";
    this.items = [
        new FolderItem("song 1"),
        new FolderItem("song 2"),
        new FolderItem("song 3"),
    ];
    
    this.getTitle = function() { return this.title; }
    this.isFolder = function() { return true; }
    this.getItems = function() {
        return this.items;
    }
}

function DesktopFolder() {
    this.title = "desktop";
    this.getTitle = function() { return this.title; }
    this.items = [
        new MusicFolder(),
        new FolderItem('other'),
    ];
    this.getItems = function() {
        return this.items;
    }
}

amino.startApp(function(core, stage) {
        
    var desktopfolder = new DesktopFolder();
    var music = desktopfolder.items[0];
    music.windowtx = 100;
    music.windowty = 150;
    music.windoww = 300;
    music.windowh = 300;
        
    var root = new amino.ProtoGroup();
    stage.setRoot(root);
    
    var desktop = new WindowView().setId("desktop").setW(600).setH(600)
        .setDraggable(false)
        .setResizable(false)
        .setMode('icon')
        .setFolder(desktopfolder)
        ;
    root.add(desktop);
    
    var window1 = new WindowView().setId('window1')
        //.setW(500).setH(300)
        .setMode('list')
        .setFolder(music)
        //.setTx(50).setTy(150).setW(300)
        ;
    root.add(window1);
    

    /*
    
    windowview has w/h x/y, title, and folder that it maps to
    iconview has x/y, title, and folder that it maps to
    
    //windowview draggable from titlebar
    //windowview resizable from lower right corner
    //windowview shows the contents of a folder
    window view can be closed
    
    desktop is another window view, but with icons
    
    folder is adhoc or query
    //folder returns an ordered list of folder items
    
    folder item is represented by an icon in the window view grid 
    or a textual row in the list view. extra properties shown as extra columns
    in the list view.
    
    clicking on an icon opens the window for the folder, if the item is a folder.
    closing a window makes the window object invisible and destroys it.  
    make sure x/y/w/h are persisted back to the folder it came from
    
    
    */
    
    
    
    

});