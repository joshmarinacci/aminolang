var amino = require('amino.js');    
var widgets = require('widgets.js');

exports.Dialer = function(stage,nav,data) {

    var panel = new widgets.AnchorPanel();
    panel.setFill("#d0d0d0");
    
    
    var dial = new widgets.AnchorPanel()
        .setAnchorLeft(true)
        .setAnchorRight(true)
        .setAnchorTop(true)
        .setAnchorBottom(true).setBottom(40)
    ;
    panel.add(dial);
    
    dial.add(new widgets.Label()
        .setText("707-707-7077").setFontSize(20)
        .setW(200).setH(50).setTx(65).setTy(15)
        );
    
    var labels = ['1','2','3', '4','5','6',  '7','8','9', '*','0','-'];
    for(var y=0; y<4; y++) {
        for(var x=0; x<3; x++) {
            var i = y*3+x;
            dial.add(new widgets.PushButton()
                .setText(labels[i])
                .setW(60).setH(45)
                .setTx(25+x*100)
                .setTy(78+y*60));
        }
    }

    var contacts = new widgets.AnchorPanel()
        .setAnchorLeft(true)
        .setAnchorRight(true)
        .setAnchorTop(true)
        .setAnchorBottom(true).setBottom(40)
        ;
    panel.add(contacts);
    
    
    contacts.add(new widgets.Label().setText("Phone")
        .setFontSize(15)
        .setAnchorLeft(true).setAnchorRight(true).setAnchorTop(true)
        .setH(20)
        );
    
    var tf = new widgets.TextField().setText("")
    .setAnchorLeft(true).setAnchorRight(true)
    .setAnchorTop(true).setTop(20);
    ;
    stage.on("change",tf,function(e) {
        console.log(tf.getText());
        filter(tf.getText());
    });
    stage.on("focusgain",tf,function() {
            //show soft keyboard
    });
    contacts.add(tf);
    
    var lv = new widgets.ListView();

    
    contacts.add(lv);
    lv.setAnchorLeft(true).setAnchorRight(true)
        .setAnchorTop(true).setTop(50)
        .setAnchorBottom(true);
    lv.setModel(data.people);
    lv.setTextCellRenderer(function(cell,i,item) {
        if(!item) return;
        cell.setText(item.first + " " + item.last);
    });
    
    var celldata = [];
    function filter(str) {
        celldata = [];
        data.people.forEach(function(item) {
            if(str.length > 1) {
                if(item.first.indexOf(str) == 0) {
                    celldata.push(item);
                }
            } else {
                celldata.push(item);
            }
        });
        lv.setModel(celldata);
    }
    
    filter('');

    contacts.setVisible(false);
    
    
    panel.add(new widgets.PushButton()
        .setText("dial")
        .setW(100).setH(30)
        .setAnchorBottom(true).setBottom(5)
        .setAnchorLeft(true).setLeft(5)
        .onAction(function() {
            dial.setVisible(true);
            contacts.setVisible(false);
        })
        );
    
    panel.add(new widgets.PushButton()
        .setText("contacts")
        .setW(100).setH(30)
        .setAnchorBottom(true).setBottom(5)
        .setAnchorRight(true).setRight(5)
        .onAction(function() {
            dial.setVisible(false);
            contacts.setVisible(true);
        })
        );
    
    nav.register(panel);
    return panel;

}
