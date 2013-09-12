var db = {
    data: {},
    monitors:[],
    updates:[],
    insert: function(def) {
        //console.log("DB inserting doc: ",def);
        if(def.doctype == undefined) console.log("ERROR. missing doctype");
        if(def.doc == undefined) console.log("ERROR. missing doc");
        if(this.data[def.doctype] == undefined) {
            this.data[def.doctype] = [];
        }
        this.data[def.doctype].push(def.doc);
        this.markUpdate({doctype:def.doctype,doc:def.doc});
    },
    query: function(def) {
        //console.log("DB querying for: ",def);
        if(def.doctype == undefined) console.log("ERROR. missing doctype");
        if(this.data[def.doctype] == undefined) return [];
        return this.data[def.doctype];
    },
    replace: function(def) {
        //console.log("DB replacing with: ",def);
        if(def.doctype == undefined) console.log("ERROR. missing doctype");
        if(def.doc == undefined) console.log("ERROR. missing doc");
        if(this.data[def.doctype] == undefined) {
            this.data[def.doctype] = [];
        }
        var arr = this.data[def.doctype];
        var found = false;
        for(var i in arr) {
            var doc = arr[i];
            if(doc.id == def.doc.id) {
                arr[i] = def.doc;
                found = true;
                break;
            }
        }
        if(!found) {
            arr.push(def.doc);
        }
        this.markUpdate({doctype:def.doctype,doc:def.doc});
    },
    monitor: function(def, cb) {
        if(this.monitors[def.doctype] == undefined) {
            this.monitors[def.doctype] = [];
        }
        this.monitors[def.doctype].push(cb);
    },
    markUpdate: function(update) {
        this.updates.push(update);
    },
    processUpdates: function() {
        var db = this;
        db.updates.forEach(function(update) {
            if(db.monitors[update.doctype]) {
                db.monitors[update.doctype].forEach(function(cb) {
                    cb(db,update.doc);
                });
            }
        });
        db.updates = [];
    }
};

exports.makeDB = function() {
    return db;
}
