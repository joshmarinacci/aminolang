var amino = require('../../build/desktop/amino.js');
var widgets = require('../../build/desktop/widgets.js');
var ContentView = require('./ContentView.js');
var WindowView = require('./WindowView.js');
var DocEditor = require('./DocEditor.js');
var DocViewer = require('./DocViewer.js');
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
exports.openDocMetaEditor = function(doc) {
    console.log("editing the document",doc);
    exports.openView(DocEditor.DocMetaEditor(doc));
}
exports.openDocViewer = function(doc) {
    console.log("viewing the document",doc);
    exports.openView(DocViewer.getDocViewer(doc));
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
                .add(new widgets.PushButton()
                    .setW(60).setH(20)
                    .setText("(i)").setFontSize(10)
                    .onAction(function() {
                        var n = lv.getSelectedIndex();
                        console.log("doing info of selected item: " + n);
                        if(n >= 0) {
                            exports.openDocMetaEditor(item.getItems()[n]);
                        }
                    }))
                .add(new widgets.PushButton()
                    .setW(60).setH(20)
                    .setText("(v)").setFontSize(10)
                    .onAction(function() {
                        var n = lv.getSelectedIndex();
                        var doc = item.getItems()[n];
                        console.log("viewing: ",doc);
                        exports.openDocViewer(doc);
                    }))
                ;
                
            view.comps.toolbar.redoLayout();
            
        }
        
        view.setFill("#cccccc");
        view.setW(400).setH(300);
        view.setTx(300).setTy(200);
          
        var winview = new WindowView.WindowView();
        winview.addTab(view,folder.getTitle());
        exports.windows.add(winview);
        winview.setTx(300).setTy(100).setW(500).setH(300);
        return;
    }
    
    if(item.isApp && item.isApp()) {
        var winview = new WindowView.WindowView();
        winview.addTab(item,item.getTitle());
        exports.windows.add(winview);
        winview.setTx(300).setTy(100).setW(500).setH(300);
        return;
    }
    
    var view = new ContentView.ContentView();
    view.setFill("#ffffff");
    var text = new widgets.TextField().setText(item.doc.content);
    text.tc.setWrapping(true);
    text.setH(300);
    view.comps.contents.add(text);
    var winview = new WindowView.WindowView();
    winview.addTab(view,item.getTitle());
    exports.windows.add(winview);
    
    winview.setTx(300).setTy(100).setW(500).setH(300);
}

