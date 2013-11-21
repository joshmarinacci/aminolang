var amino   = require('amino.js');
var widgets = require('widgets.js');

exports.getDocViewer = function(doc) {
    var panel = new widgets.AnchorPanel();
    panel.isApp = function() { return true; }
    panel.getTitle = function() { return "viewing"; }
    
    console.log("type = " + doc.getType());
    
    if(doc.getType() == 'com.joshondesign.aminos.photo.jpeg') {
        console.log("doing a jpeg");
        var img = new amino.ProtoImageView();
        console.log("loading image " + doc.doc.file);
        img.isApp = function() { return true; }
        img.getTitle = function() { return doc.doc.title; }
        img.setSrc(doc.doc.file);
        img.setW(doc.doc.width/3.0);
        img.setH(doc.doc.height/3.0);
        return img;
//        panel.add(img);
    }
    
    if(doc.getType() == 'com.joshondesign.aminos.text.plain') {
        console.log("doing a plain doc");
        var tf = new widgets.TextField().setText(doc.doc.content);
        tf.tc.setWrapping(true);
        tf.setAnchorLeft(true).setAnchorTop(true).setAnchorBottom(true).setAnchorRight(true);
        panel.add(tf);
        panel.setFill("#ff0000");
    }
    
    
    return panel;
}

