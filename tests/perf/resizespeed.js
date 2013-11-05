var amino = require('amino.js');
var widgets = require('widgets.js');


var EmailListViewCell = amino.ComposeObject({
    type: "EmailListViewCell",
    extend: amino.ProtoWidget,
    comps: {
        background: {
            proto: amino.ProtoRect,
            promote: ['w','h','fill'],
        },
        line: {
            proto: amino.ProtoRect,
        },
        from: {
            proto: amino.ProtoText,
        },
        subject: {
            proto: amino.ProtoText,
        },
        desc: {
            proto: amino.ProtoText,
        },
    },
    init: function() {
        this.comps.base.add(this.comps.background);
        this.comps.base.add(this.comps.line);
        
        this.comps.from.setText("from")
            .setFill("#3498db")
            .setFontWeight(600)
            .setTx(8).setTy(22)
            .setFontSize(15);
        this.comps.base.add(this.comps.from);

        this.comps.subject.setText("subject")
            .setTx(8).setTy(42)
            .setFontSize(15);
        this.comps.base.add(this.comps.subject);
        
        this.comps.desc.setText("desc")
            .setTx(8).setTy(64)
            .setFontWeight(200)
            .setFontSize(15);
        this.comps.base.add(this.comps.desc);
    },
});

amino.startApp(function(core,stage) {
    stage.setSize(1200,600);
    var lv = new widgets.ListView()
        .setFill("#ffffff")
        .setCellHeight(80)
        ;
    stage.setRoot(lv);
    // view.comps.contents.add(lv);
    
    var models = [];
    for(var i=0; i<100; i++) {
        models.push({
            doctype: 'com.joshondesign.aminos.email.message',
            doc: {
                title:"an email "+i,
                from: "foo@bar.com",
                to: "bar@foo.com",
                subject:"Subjects are for the weak!"+Math.floor(Math.random()*100),
                body: "Hah. You read the message! Foolish mortal.",
            }
        });
    }
    lv.setModel(models);
    lv.setCellGenerator(function() { return new EmailListViewCell(); });
    
    lv.setTextCellRenderer(function(cell,index,item) {
        if(item == null) return;
        cell.comps.from.setText(item.from);
        cell.comps.subject.setText(item.doc.subject.substring(0,30));
        cell.comps.desc.setText(item.doc.body.substring(0,50));
        cell.comps.background.setFill("#fffffa");
        cell.comps.line.setFill("#f1ebeb");
        cell.comps.line.setH(1);
        cell.comps.line.setW(cell.getW());
        //cell.setText(email.doc.from + " : " + email.doc.subject);
        //console.log(email);
    });
    
    setTimeout(function() {
        amino.startTime();
        lv.setW(300);
    },1000);
   
    /*
	var results = core.runTest({
		count: 1*60,
		sync: false,
		events: false,
		anim: false,
	});
	console.log(results);
	console.log("avg frame len = " + results.totalTime/results.count);
    */
});

