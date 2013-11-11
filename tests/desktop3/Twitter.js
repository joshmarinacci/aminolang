var amino = require('../../build/desktop/amino.js');
var widgets = require('../../build/desktop/widgets.js');

exports.ConnectViewCustomizer = function(view,folder) {
    var lv = new widgets.ListView().setFill("#ffffff");
    lv.setModel(folder.getItems());
    lv.setTextCellRenderer(function(cell,index,item) {
        if(item == null) return;
        cell.comps.label.setText(item.doc.title);
    });
    lv.setAnchorLeft(true).setAnchorBottom(true).setAnchorTop(true);
    lv.setAnchorRight(true).setRight(300);
    view.comps.contents.add(lv);
    view.comps.toolbar
        .add(
            new widgets.PushButton().setW(20).setH(20).setFontSize(20).setFontName('awesome')
            .setText('\uf067').onAction(function(e) {
                    //add a new contact
            }))
    view.comps.toolbar.redoLayout();
}

