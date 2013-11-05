var amino = require('../../build/desktop/amino.js');
var widgets = require('../../build/desktop/widgets.js');
var ContentView = require('./ContentView.js');
var WindowView = require('./WindowView.js');
exports.windowlist = [];

exports.windows = null;

exports.splitWindow = function(tab, window,x,y) {
    window.comps.contents.remove(tab.content);
    window.comps.tabholder.remove(tab);
    window.layoutTabs();
    var winview = new WindowView.WindowView();
    winview.setTx(x).setTy(y).setW(window.getW()).setH(window.getH());
    winview.addExistingTab(tab);
    exports.windows.add(winview);
}

exports.mergeWindow = function (tab, window, gpt) {
    tab.window.comps.contents.remove(tab.content);
    tab.window.comps.tabholder.remove(tab);
    tab.window.layoutTabs();
    if(tab.window.getTabCount() < 1) {
        tab.window.destroy();
    }
    tab.window = window;
    tab.window.addExistingTab(tab);
    exports.windows.raiseToTop(tab.window);
}

exports.openView = function(item) {
    if(item.isFolder && item.isFolder()) {
        var folder = item;
        var view = new ContentView.ContentView();
        
        if(folder.customizer) {
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
        
        view.setFill("#cccccc");
        view.setW(400).setH(300);
        view.setTx(300).setTy(200);
          
        var winview = new WindowView.WindowView();
        winview.addTab(view,folder.getTitle());
        exports.windows.add(winview);
        winview.setTx(100).setTy(100).setW(500).setH(300);
        return;
    }
    
    if(item.isApp && item.isApp()) {
        var winview = new WindowView.WindowView();
        winview.addTab(item,item.getTitle());
        exports.windows.add(winview);
        winview.setTx(100).setTy(100).setW(500).setH(300);
        return;
    }
    
    var view = new WindowView();
    view.setFill("#ffffff");
    var text = new widgets.TextField()
        .setText(item.doc.content);
    view.comps.contents.add(text);
    var winview = new WindowView();
    winview.addTab(view,item.getTitle());
    exports.windows.add(winview);
    
    winview.setTx(100).setTy(100).setW(500).setH(300);
}

