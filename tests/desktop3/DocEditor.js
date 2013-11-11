var amino   = require('../../build/desktop/amino.js');
var widgets = require('../../build/desktop/widgets.js');
exports.DocMetaEditor = function(item) {
    var panel = new widgets.VerticalPanel();
    panel.isApp = function() { return true; }
    panel.getTitle = function() { return "editing"; }
    
    
    console.log(item.doc);
    for(var key in item.doc) {
        console.log(key);
        panel.add(new widgets.Label().setText(key));
        var value = item.doc[key];
        panel.add(new widgets.TextField().setText(value));
    }
    
    panel.add(new widgets.PushButton()
            .setText("Save").setW(100).setH(30));
            
    return panel;
    
}
