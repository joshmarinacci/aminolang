var fs = require('fs');
var child_process = require('child_process');

function setupContacts(nav,stage,core) {
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
    function showResults(res, filter) {
        console.log("command line x = " + cl.getTx() + " " + cl.getTy());
        popup.setVisible(true);
        popup.setTx(cl.getTx());
        popup.setTy(cl.getTy()-popup.getH());
        var view = stage.find("searchResults");
        view.listModel = res;
        view.cellRenderer = function(gfx,info,bounds) {
            var color = "#ccffff";
            if(info.list.selectedIndex == info.index) { color = "#44aaff"; }
            gfx.fillQuadColor(color, bounds);
            
            var txt = info.item.firstname + " " + info.item.lastname;
            if(filter) {
                txt = "";
                if(filter.first) txt += info.item.firstname + " ";
                if(filter.last)  txt += info.item.lastname  + " ";
                if(filter.phone) txt += info.item.phone     + " ";
                if(filter.email) txt += info.item.email     + " ";
            }
            gfx.fillQuadText("#000000", 
                txt,
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
    
    function clearCommandLine() {
        cl.setText("");
    }
    
    function showCallScreen(person) {
        var group = core.createGroup();
        var rect = core.createRect().setW(600).setH(300).setFill("#00ff00");
        group.add(rect);
        var label = core.createLabel().setText(person.phone).setFontSize(60)
            .setTx(100).setTy(200);
        group.add(label);
        group.setTx(100).setTy(100);
        stage.getRoot().add(group);
        stage.on("PRESS",rect,function() {
                stage.getRoot().remove(group);
        });
    }
    
    function createNewEmail(person) {
        console.log("emailing:",person);
        var script = 'tell application "Mail"\n'
            +' make new outgoing message with properties {visible:true}\n'
            +' tell result\n'
            +'  make new to recipient with properties {address:"'+person.email+'"}\n'
           // +'  make new attachment with properties {file name:"cake.jpg"}\n'
            +' end tell\n'
            +'end tell\n'
        ;
        fs.writeFileSync("blah.as",script);
        var as = child_process.spawn('osascript',['blah.as']);
        as.stdout.on('data', function(data) {
                console.log("stdout "+data);
        });
        as.stderr.on('data', function(data) {
                console.log("stderr "+data);
        });
    }
    
    var actions = [
        {
            regex: /^s*call\s+/i,
            name:"call",
            complete: function(text) {
                var name = text.match(/^s*call\s+(.*)$/i);
                if(name) {
                    var results = searchContacts(name[1]);
                    if(results.length > 0) {
                        showResults(results, { first:true, last:true, phone:true });
                    } else {
                        hideResults();
                    }
                }
            },
            finish: function(text) {
                var name = text.match(/^s*call\s+(.*)$/i);
                if(name) {
                    var results = searchContacts(name[1]);
                    if(results.length > 0) {
                        showCallScreen(results[0]);
                    }
                    clearCommandLine();
                    hideResults();
                }
            }
        },
        
        {
            regex: /^s*todo\s+/i,
            name:"todo",
            finish: function(text) {
                var desc = text.match(/^s*todo\s+(.*)$/);
                if(desc) {
                    console.log('adding a new todo item:',desc[1]);
                    clearCommandLine();
                }
            }
        },
        
        {
            regex: /^s*e?mail\s+/i,
            name:"mail",
            complete: function(text) {
                var name = text.match(/^s*mail\s+(.*)$/i);
                if(name) {
                    var results = searchContacts(name[1]);
                    if(results.length > 0) {
                        showResults(results, { first:true, last:true, email:true});
                    } else {
                        hideResults();
                    }
                }
            },
            finish:function(text) {
                var name = text.match(/^s*mail\s+(.*)$/i);
                if(name) {
                    var results = searchContacts(name[1]);
                    if(results.length > 0) {
                        createNewEmail(results[0]);
                    }
                    clearCommandLine();
                    hideResults();
                }
            }
        }
        
    ];
    
    var currentAction = null;
    function applyAction(text) {
        if(currentAction) {
            if(currentAction.finish) {
                currentAction.finish(text);
            }
        }
    }
    
    function evaluateAction(text) {
        for(var i in actions) {
            var act = actions[i];
            if(text.match(act.regex)) {
                currentAction = actions[i];
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
        
        //esc key
        if(kp.keycode == 257) {
            if(popup.getVisible()) {
                hideResults();
            } else {
                clearCommandLine();
            }
            return;
        }
        
        //return key
        if(kp.keycode == 294) {
            applyAction(cl.getText());
            return;
        }
        evaluateAction(cl.getText());
    });

}

exports.setupContacts = setupContacts;
