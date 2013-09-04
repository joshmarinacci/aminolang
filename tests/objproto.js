var amino = require('../build/desktop/amino.js');
var widgets = require('../build/desktop/widgets.js');

amino.startApp(function(core, stage) {
        

    var group = new amino.ProtoGroup().setTx(0);
    stage.setRoot(group);
    
    group.add(new amino.ProtoRect()
            .setFill("#ff00ff")
            .setW(50));
    
    var label = new amino.ProtoText();
    label.setTx(0).setTy(50);
    group.add(label);
    
    var button = new widgets.Button()
        .setId("button1")
        .setTy(200).setTx(100)
        .setW(100).setH(50)
        .setText('button');
    group.add(button);
    
    core.on('action',button, function(e) {
        console.log("the button " + e.source.getId() + " fired an action");
    });
    
    var slider = new widgets.Slider()
        .setW(200).setH(30)
        .setTx(100).setTy(300)
        .setValue(33);
    group.add(slider);
});
