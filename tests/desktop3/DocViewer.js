var amino   = require('amino.js');
var widgets = require('widgets.js');

exports.getDocViewer = function(db,doc) {
    var panel = new widgets.AnchorPanel();
    panel.isApp = function() { return true; }
    panel.getTitle = function() { return "viewing"; }
    
    console.log("doc = ",doc);
    
    if(doc.doctype == 'com.joshondesign.aminos.photo.jpeg') {
        console.log("doing a jpeg");
        var img = new amino.ProtoImageView();
        console.log("loading image " + doc.doc.file);
        img.isApp = function() { return true; }
        img.getTitle = function() { return doc.doc.title; }
        img.setSrc(doc.doc.file);
        img.setW(doc.doc.width/3.0);
        img.setH(doc.doc.height/3.0);
        return img;
    }
    
    if(doc.doctype == 'com.joshondesign.aminos.text.plain') {
        console.log("doing a plain doc");
        var saveButton = new widgets.PushButton().setText('save')
            .setW(60).setH(30)
            ;
        
        panel.add(saveButton);
        console.log(doc);
        var tf = new widgets.TextField().setText(doc.doc.content);
        tf.tc.setWrapping(true);
        tf.setAnchorLeft(true).setAnchorTop(true).setAnchorBottom(true).setAnchorRight(true);
        tf.setTop(30);
        panel.add(tf);
        saveButton.onAction(function() {
            console.log("saving the document");
            console.log("database = ",db);
            doc.doc.content = tf.getText();
            console.log("doc = ",doc);
            db.replace(doc);
        });
    }
    
    
    return panel;
}

