var amino = null;
var widgets = null;
if(process.platform == 'darwin') {
    amino = require('../../build/desktop/amino.js');
    widgets = require('../../build/desktop/widgets.js');
} else {
    amino = require('./amino.js');    
    widgets = require('./widgets.js');
}


amino.startApp(function(core, stage) {
    stage.setSize(320,480);
    
    console.log(core.getFont('source'));
    
    var root = new amino.ProtoGroup();
    stage.setRoot(root);


    var font = core.getFont('source');
    var i = 0;
    for(var weight in font.weights) {
        i++;
        root.add(new widgets.Label()
            .setW(200).setH(30)
            .setFontSize(15)
            .setFontWeight(weight)
            .setText("ABCabc123 " + weight)
            .setFill("#000000")
            .setFontName("source")
            .setAlign("left")
            .setTx(0).setTy(30*i));
    }
    
    
});
