var db = require('./database').makeDB();
var citydoctype = "com.joshondesign.aminos.weather.city";
var weatherdoctype = "com.joshondesign.aminos.weather.info";
var emaildoctype = "com.joshondesign.aminos.email.message";

var emailservice = {
    desc: "Email",
    uuid: "com.joshondesign.aminos.email.EmailService",
    create: function() {
        console.log("setting up the email service");
    },
    triggers: [
        {
            kind: "periodic",
            period: "5m",
            access:["network"],
            call: function(db) {
                console.log("Fetching email");
                db.insert({doctype:emaildoctype,doc: {
                        from: "foo@bar.com",
                        to: "bar@foo.com",
                        subject:"Subjects are for the weak!"+Math.floor(Math.random()*100),
                        body: "Hah. You read the message! Foolish mortal.",
                }});
            },
        }
    ],
};

var weather = {
     desc: "Weather",
     uuid: "com.joshondesign.aminos.weather.WeatherService",
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
AddService(emailservice);



// now we are on the GUI side
//monitor for new stuff

db.monitor({doctype:weatherdoctype, action:"any"}, function(db,data) {
    console.log("weather data changed: ",data);
    var count = db.query({doctype:weatherdoctype}).length;
    console.log("total weather count is now: " + count);
});

db.monitor({doctype:emaildoctype, action:"insert"}, function(db,data) {
    console.log("new email doc added: ");
    var count = db.query({doctype:emaildoctype}).length;
    console.log("total email count is now: " + count);
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
    if(service.create) service.create();
}

function processService(svc) {
    svc.triggers.forEach(function(trig) {
        if(trig.kind == "periodic") {
            trig.call.apply(svc,[db]);
        }
    });
}





