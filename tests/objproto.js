var amino = require('../build/desktop/amino.js');
var widgets = require('../build/desktop/widgets.js');

amino.startApp(function(core, stage) {
        

    var group = new amino.ProtoGroup().setTx(0);
    stage.setRoot(group);
    
    group.add(new amino.ProtoRect()
            .setFill("#ff00ff")
            .setW(50));
    
    var text = new amino.ProtoText();
    text.setTx(0).setTy(50);
    group.add(text);
    
    var button = new widgets.Button()
        .setId("button1")
        .setTy(200).setTx(100)
        .setW(100).setH(50)
        .setText('button');
    group.add(button);
    
    
    var slider = new widgets.Slider()
        .setW(200).setH(30)
        .setTx(100).setTy(300)
        .setValue(33);
    group.add(slider);
    
    
    var spinner = new widgets.ProgressSpinner();
    spinner.setSize(50).setTx(100).setTy(50);
//    spinner.setActive(true);
    group.add(spinner);
    
    core.on('action',button, function(e) {
        console.log("the button " + e.source.getId() + " fired an action");
        spinner.setActive(true);
    });
    
    var label = new widgets.Label();
    label.setTx(100).setTy(100)
        .setText("A Big Label")
        .setW(100);
    group.add(label);
    
    
    var image = new amino.ProtoImageView();
    image.setTx(50).setTy(50);
    image.setSrc("images/beatles_01.jpg");
    group.add(image);
    
    
    var panel = new widgets.AnchorPanel();
    panel.setTx(300).setTy(20).setW(300).setH(300);
    group.add(panel);
    
    //left anchored
    panel.add(new widgets.Button()
        .setW(120).setH(30)
        .setAnchorLeft(true));
    
    //right anchored
    panel.add(new widgets.Button()
        .setW(120).setH(30)
        .setTy(50)
        .setAnchorRight(true));
    
    //left and right anchored, making it stretch
    panel.add(new widgets.Button()
        .setW(120).setH(30)
        .setTy(100)
        .setAnchorRight(true).setAnchorLeft(true));
    
    //bottom left anchored, then moved up by 10 px
    panel.add(new widgets.Button()
        .setW(120).setH(30)
        .setAnchorBottom(true).setBottom(10));
});
