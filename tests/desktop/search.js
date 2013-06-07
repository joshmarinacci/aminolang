function setupContacts(nav,stage) {
    var contents = [
        {
            type:'contact',
            firstname:"Josh",
            lastname:"Marinacci",
            email: "joshua@marinacci.org",
            phone: "707-509-9627"
        },
        {
            type:'contact',
            firstname:"Jen",
            lastname:"Marinacci",
            email: "jen@marinacci.org",
            phone: "asdf",
        }
    ]
    
    var cl = stage.find("commandLine");
    console.log("command line = ");
    console.log(cl);
    cl.setText("");
    
    var popup = stage.find("commandlinePopup");
    popup.setVisible(false);
    
    function searchContacts(txt) {
        txt = txt.toLowerCase();
        var results = [];
        for(var i in contents) {
            var con = contents[i];
            if(con.firstname.toLowerCase().indexOf(txt) !== -1) {
                results.push(con);
                continue;
            }
            if(con.lastname.toLowerCase().indexOf(txt)  !== -1) {
                results.push(con);
                continue;
            }
        }
        return results;
    }
    function showResults(res) {
        popup.setVisible(true);
        popup.setTx(10);
        popup.setTy(10);
        var view = stage.find("searchResults");
        view.listModel = res;
        view.cellRenderer = function(gfx,info,bounds) {
            var color = "#ccffff";
            if(info.list.selectedIndex == info.index) { color = "#44aaff"; }
            gfx.fillQuadColor(color, bounds);
            gfx.fillQuadText("#000000", 
                info.item.firstname + " " + info.item.lastname,
                bounds.x+5, bounds.y, info.list.getFontSize(), info.list.font.fontid);
        }
        view.setFontSize(15);
    }
    function hideResults() {
        popup.setVisible(false);
    }
    /*
    stage.on("CHANGED",cl,function(e) {
        var results = searchContacts(cl.getText());
        if(results.length > 0) {
            showResults(results);
        }
    });
    */
    
    var actions = [
        {
            regex: /^s*call\s+/i,
            name:"call",
            complete: function(text) {
                var name = text.match(/^s*call\s+(.*)$/i);
                if(name) {
                    console.log("auto completing with the text:",name[1]);
                    var results = searchContacts(name[1]);
                    console.log(results);
                    if(results.length > 0) {
                        showResults(results);
                    } else {
                        hideResults();
                    }
                }
            }
        },
        {
            regex: /^s*todo\s+/i,
            name:"todo",
        },
        {
            regex: /^s*e?mail\s+/i,
            name:"mail"
        }
    ];
    
    var currentAction = null;
    function applyAction(text) {
        console.log("applying",text, " to action",currentAction);
    }
    
    function evaluateAction(text) {
        console.log("evaluating",text);
        for(var i in actions) {
            var act = actions[i];
            if(text.match(act.regex)) {
                currentAction = actions[i];
                console.log("evaluating action: " + act.name);
                if(act.complete) {
                    act.complete(text);
                }
                return;
            }
        }
        currentAction = null;
        hideResults();
    }
    
    stage.on("KEYPRESS",cl,function(kp) {
            console.log("pressed: ",kp.keycode);
            //pressed the enter key
        if(kp.keycode == 294) {
            applyAction(cl.getText());
        } else {
            evaluateAction(cl.getText());
        }
    });

}

exports.setupContacts = setupContacts;
