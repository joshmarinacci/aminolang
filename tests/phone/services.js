var citydoctype = "com.joshondesign.aminos.weather.city";
var weatherdoctype = "com.joshondesign.aminos.weather.info";

var weather = {
     desc: "Weather",
     uuid: "com.joshondesign.aminos.WeatherService",
     create: function() {
          console.log("i'm in the init function");
          //anything you put on the 'this' variable can be accessed later in other funds.
     },
     destroy: function() {
          console.log("removing any persistent structures, which we shouldn't have in general");
     },
     funcs: {
          updateWeatherData: function(db) {
              console.log("updating the weather data");
              db.query({doctype:citydoctype}).forEach(function(city) {
                  console.log("getting the weather for city: ",city);
                  db.replace({
                      doctype: weatherdoctype,
                      doc: {
                          id: city.id,
                          cityid: city.id,
                          temp: Math.random(),
                          units: "K",
                      }
                  });
              });
              /*
                    db.query({doctype:"com.joshondesign.aminos.weather.city"})
                         .forEach(function(city) {
                              WeatherAPI.fetch(city.id, function(info) {
                                   db.insert({
                                        doctype:"com.joshondesign.aminos.weather.data",
                                        cityid:city.id, 
                                        temp:info.temp, 
                                        units:info.units})
                                   .on('*',log); // a global log function which is aware of the current service and time
                              });
                         });
             */
          }
     },
     triggers: [
          {
               kind: "periodic",
               period: "10s",
               access: ["network"],
               call: function(db) {
                    this.funcs.updateWeatherData(db);
               }
          },
          {
               kind: "database",
               dbaction: ['insert','update'],
               doctype: 'com.joshondesign.aminos.weather.city',
               call: function(db, action, docs) {
                    console.log("db updated or inserted: ", action, docs);
                    //console.log("changed docs",docs);
                    //this.updateWeatherData(db);
               }
          }
               
     ]
};

var services = [];
StartServices();
AddService(weather);

var db = {
    data: {},
    monitors:[],
    updates:[],
    insert: function(def) {
        //console.log("DB inserting doc: ",def);
        if(def.doctype == undefined) console.log("ERROR. missing doctype");
        if(this.data[def.doctype] == undefined) {
            this.data[def.doctype] = [];
        }
        this.data[def.doctype].push(def.doc);
        this.markUpdate(def.doctype);
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


// now we are on the GUI side
//monitor for new stuff

db.monitor({doctype:weatherdoctype, action:"any"}, function(db,data) {
    console.log("weather data changed: ",data);
});
    

//add a city
var city = {
    id:"KEUG",
    desc: "Eugene, Oregon"
};
db.insert({ doctype: citydoctype,  doc: city });


//add another city in 10 seconds
setTimeout(function() {
    console.log("adding a second city");
    db.insert({doctype:citydoctype, doc: { id: "KSPR", desc: "Springfield, Oregon"}});
},10*1000);




function StartServices() {
    console.log("starting the services");
    setInterval(function() {
        console.log("============");
        console.log("processing services");
        services.forEach(processService);
        console.log("processing updates");
        db.processUpdates();
    },3000);
}

function AddService(service) {
    //console.log(service);
    services.push(service);
}

function processService(svc) {
    svc.triggers.forEach(function(trig) {
        if(trig.kind == "periodic") {
            trig.call.apply(svc,[db]);
        }
    });
}





