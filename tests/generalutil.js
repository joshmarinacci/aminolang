if(typeof exports == 'undefined') {
    var exports = this['generalutil'] = {};
}

function doGeneralUtil() {
    console.log("doing the general util");
}

function shapes(c,core,stage) {
    var rect = core.createRect();
    rect.setX(100).setY(100).setW(50).setH(25).setFill("#00ff00");
    c.add(rect);
    
    stage.on("PRESS", rect, function() {
        console.log("rect is pressed", rect.getFill());
        if(rect.getFill() == '#0000ff') {
            rect.setFill("#ff0000");
        } else {
            rect.setFill('#0000ff'); 
        }
    }); 
    
    
    var r2 = core.createRect();
    r2.setTx(50).setTy(200).setW(60).setH(60).setFill('#88ff88');
    c.add(r2);
    

    
    
    //e.target is a generic reference to the drag target.
    //e.deltaX is how much the x moved between events, regardless of the current
    //coordinate space's movement (ie: setting the x and y)
    //drag works even if you drag quickly and go outside the target, thus it
    //preserves the drag target through the entire gesture
    
    stage.on("DRAG", r2, function(e) {
        e.target.setTx(e.target.getTx() + e.dx);
        e.target.setTy(e.target.getTy() + e.dy);
    });
    
    
    
    var r3 = core.createRect();
    r3.setX(60).setY(100).setW(50).setH(50).setFill("#ff00ff");//.setOpacity(0.5);
    c.add(r3);
    
}

function comps(c,core,stage) {

    var button = core.createPushButton();
    button.setText("button").setTx(10).setTy(70);
    c.add(button);
    

    var tbutton = core.createToggleButton();
    tbutton.setText("toggle");
    tbutton.setTx(10).setTy(120);
    c.add(tbutton);
    
    var label = core.createLabel();
    label.setText("A Label");
    label.setTextColor("#008800");
    label.setTx(10);
    label.setTy(180);
    c.add(label);
    
    var slider = core.createSlider();
    slider.setTx(10).setTy(200);
    slider.setW(150).setH(30);
    c.add(slider);
    
    
    
    
    var textbox = core.createTextField();
    textbox.setTx(200).setTy(230).setW(150).setH(30);
    textbox.setText("foo");
    c.add(textbox);
    
    
    
    var listview = core.createListView();
    listview.setW(200).setH(200).setTx(380).setTy(30);
    c.add(listview);
  
}

function events(c, core,stage) {
    
    var b1 = core.createPushButton().setText("no trans").setX(10).setY(100).setW(100).setH(30);
    c.add(b1);
    
    var b2 = core.createPushButton().setText("trans xy").setTx(120).setTy(100).setW(100).setH(30);
    c.add(b2);
    
    var b3 = core.createPushButton().setText("group trans").setTx(0).setTy(0).setW(100).setH(30);
    var g3 = core.createGroup().setTx(230).setTy(100);
    g3.add(b3);
    c.add(g3);
    
    var b4 = core.createPushButton().setText("rotate").setTx(0).setTy(0).setW(100).setH(30);
    
    var g4 = core.createGroup().setTx(10).setTy(150).setRotateZ(45);
    g4.add(b4);
    c.add(g4);
    
    
    var b5 = core.createPushButton().setText("scale").setTx(0).setTy(0).setW(100).setH(30);
    var g5 = core.createGroup().setTx(120).setTy(150).setScalex(2).setScaley(2);
    g5.add(b5);
    c.add(g5);
    
    
    var slider = core.createSlider().setW(100).setH(30);
    slider.setTx(100);
    slider.setTy(250);
    c.add(slider);
    
}


exports.shapes = shapes;
exports.comps = comps;
exports.events = events;
