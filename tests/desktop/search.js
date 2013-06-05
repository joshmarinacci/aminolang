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
            }
            if(con.lastname.toLowerCase().indexOf(txt)  !== -1) {
                results.push(con);
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
    stage.on("CHANGED",cl,function(e) {
        var results = searchContacts(cl.getText());
        if(results.length > 0) {
            showResults(results);
        }
    });
}

exports.setupContacts = setupContacts;
