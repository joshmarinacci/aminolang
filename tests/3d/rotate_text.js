var amino = require('amino.js');
var widgets= require('widgets.js');

var strings = [
    "Mandela's Birthday\nMarked Charitable Acts",
    "Typhoon Rammasun\nbatters southern China",
    "Forbes sold to\nAsian investors",
    "Unemployment rates fell\nin 22 US states in June",
]

var i = 0;

amino.startApp(function(core, stage) {
    stage.setSize(1280,720);
    var group = new amino.ProtoGroup();

// 10,12,15,20,30,40,80


    var text1 = new amino.ProtoText()
        .setTx(100).setTy(720/2)
        .setText(strings[i].split('\n')[0])
        .setFill("#33cc44").setFontSize(80);

    var text2 = new amino.ProtoText()
        .setTx(100).setTy(720/2+100)
        .setText(strings[i].split('\n')[1])
        .setFill("#33cc44").setFontSize(80);
    group.add(text1);
    group.add(text2);

    stage.setRoot(group);
    function swingIn() {
        text1.setText(strings[i].split('\n')[0]);
        text2.setText(strings[i].split('\n')[1]);
        i = (i + 1) % strings.length;
        var anim = core.createPropAnim(group,"rotateY",-140,0,1500);
    }
    function swingOut() {
    	var anim1 = core.createPropAnim(group,"rotateY",0, 140, 1500);
        anim1.after(swingIn);
    }
    setInterval(swingOut,6000);
});
