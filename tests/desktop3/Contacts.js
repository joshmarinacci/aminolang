var amino = require('../../build/desktop/amino.js');
var widgets = require('../../build/desktop/widgets.js');

exports.ContactsViewCustomizer = function(view,folder) {
    var panel = new widgets.AnchorPanel().setW(300).setH(300);
    view.comps.contents.add(panel);

    var lv = new widgets.ListView().setFill("#ffffff");
//    view.comps.contents.add(lv);
    lv.setModel(folder.getItems());
    lv.setTextCellRenderer(function(cell,index,item) {
        if(item == null) return;
        cell.comps.label.setText(item.doc.doc.title);
    });
    lv.setAnchorLeft(true).setAnchorBottom(true).setAnchorTop(true);
    lv.setAnchorRight(true).setRight(300);
    panel.add(lv);
    
    panel.add(new widgets.Label().setText('name')
        .setAnchorRight(true).setRight(230)
        .setAnchorTop(true).setTop(10));
    panel.add(new widgets.Label().setText('company')
        .setAnchorRight(true).setRight(230)
        .setAnchorTop(true).setTop(40));
    panel.add(new widgets.Label().setText('address')
        .setAnchorRight(true).setRight(230)
        .setAnchorTop(true).setTop(70));
    var name = new widgets.Label().setText("----")
        .setAnchorRight(true).setRight(130)
        .setAnchorTop(true).setTop(10)
        ;
    panel.add(name);
        
    
    amino.getCore().on("select",lv,function(e) {
        var n = e.source.getSelectedIndex();
        var item = folder.getItems()[n];
        name.setText(item.doc.doc.firstname + " " + item.doc.doc.lastname);
    });
    
    view.comps.toolbar
        .add(
            new widgets.PushButton().setW(20).setH(20).setFontSize(20).setFontName('awesome')
            .setText('\uf067').onAction(function(e) {
                    //add a new contact
            }))
    view.comps.toolbar.redoLayout();
}

