//var amino = require('./amino.js'); //change to wherever you end up putting amino
//var widgets = require('./widgets.js');
var amino = require('../build/desktop/amino.js');
var widgets = require('../build/desktop/widgets.js');

//stage will be created for us already
amino.startApp(function(core,stage) {
        
    //always use a group for your scene root
    var group = new amino.ProtoGroup();
    core.setRoot(group);
    
    
    //button
    var button = new widgets.Button();
    button.setText("Activate!");
    button.setFontSize(40);
    button.setTx(0);
    button.setTy(0);
    button.setW(200);
    button.setH(80);
    group.add(button);

    var rect = new amino.ProtoRect()
        .setW(200)
        .setH(80)
        .setTx(0)
        .setTy(300)
        .setFill("#33FFDD");
    group.add(rect);
        
    
    core.on("action",button, function() {
        console.log("you activated the button");
        //create an animation
        // tx goes from 0 to 400 over 600ms. do it once (1). no auto reverse
        var anim = core.createPropAnim(rect,"tx",0, 400, 600, 1, false);
        //optional
        anim.setInterpolator(amino.Interpolators.CubicInOut);
    });
       
    
});
