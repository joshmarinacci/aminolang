var amino = require('amino.js');
var widgets = require('widgets.js');

exports.EmailListViewCell = amino.ComposeObject({
    type: "EmailListViewCell",
    extend: amino.ProtoWidget,
    comps: {
        background: {
            proto: amino.ProtoRect,
            promote: ['w','h','fill'],
        },
        line: {
            proto: amino.ProtoRect,
        },
        from: {
            proto: amino.ProtoText,
        },
        subject: {
            proto: amino.ProtoText,
        },
        desc: {
            proto: amino.ProtoText,
        },
    },
    init: function() {
        this.comps.base.add(this.comps.background);
        this.comps.base.add(this.comps.line);
        
        this.comps.from.setText("from")
            .setId("from")
            .setFill("#3498db")
            .setFontWeight(600)
            .setTx(8).setTy(22)
            .setFontSize(15);
        this.comps.base.add(this.comps.from);

        this.comps.subject.setText("subject")
            .setId("subject")
            .setTx(8).setTy(42)
            .setFontSize(15);
        this.comps.base.add(this.comps.subject);
        
        this.comps.desc.setText("desc")
            .setTx(8).setTy(64)
            .setFontWeight(200)
            .setFontSize(15);
        this.comps.base.add(this.comps.desc);
    },
});

exports.EmailViewCustomizer = function(view,folder) {
    var lv = new widgets.ListView()
        .setFill("#ffffff")
        .setCellHeight(80)
        .setId("EmailListView")
        ;
    view.comps.contents.add(lv);
    lv.parent = view.comps.contents;

    lv.setModel(folder.getItems());
    lv.setCellGenerator(function() { return new exports.EmailListViewCell(); });
    
    lv.setTextCellRenderer(function(cell,index,item) {
        if(item == null) return;
        console.log('item = ',item);
        cell.comps.from.setText(item.doc.from);
        cell.comps.subject.setText(item.doc.doc.subject.substring(0,30));
        cell.comps.desc.setText(item.doc.doc.body.substring(0,50));
        cell.comps.background.setFill("#fffffa");
        if(index == lv.getSelectedIndex()) {
            cell.comps.background.setFill("#aaaafa");
        }
        cell.comps.line.setFill("#f1ebeb");
        cell.comps.line.setH(1);
        cell.comps.line.setW(cell.getW());
        //cell.setText(email.doc.from + " : " + email.doc.subject);
        //console.log(email);
    });
    if(folder.onUpdate) {
        folder.onUpdate(function(doc) {
            lv.setModel(folder.getItems());
        });
    }


    view.comps.toolbar
        .add(new widgets.PushButton().setW(30).setH(30).setFontSize(20).setFontName('awesome')
            .setText("\uf112").onAction(function(e) {
            }))
        .add(new widgets.PushButton().setW(30).setH(30).setFontSize(20).setFontName('awesome')
            .setText("\uf044").onAction(function(e) {
            }))
        ;
    view.comps.toolbar.redoLayout();
}


