var amino = require('../../build/desktop/amino.js');
var widgets = require('../../build/desktop/widgets.js');

exports.buildApp = function(core, stage, db) {
    console.log("building the settings app");
    var panel = new widgets.AnchorPanel();
    panel.isApp = function() { return true; }
    panel.getTitle = function() { return "Settings"; }
    
    var label = new widgets.Label().setText("Desktop Background")
        .setAnchorTop(true).setTop(10)
        .setAnchorLeft(true).setLeft(10)
        ;
    panel.add(label);
    
    

    return panel;
}

