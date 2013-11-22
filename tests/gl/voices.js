var http = require('http')
var path = require('path');
var request = require('request');
var jar = request.jar();

function Server(data) {
    //console.log("data = ",data);
    this.server = data.server;
    this.username = data.username;
    this.password = data.password;
    this.debug = data.debug || false;
    
this.getBase = function(port) {
    if(port != undefined) {
        return "http://"+this.server+".nokiaconnect.net:"+port+"/";
    }
    return "http://"+this.server+".nokiaconnect.net/";
}

this.dprint = function(s) {
    if(this.debug) {
        console.log(s);
    }
}
var statuscodes = {
    '200':'200: Successful response',
    '600':'600: Device Offline',
    '201':'When contents are created successfully for POST requests',
    '400':'when a user request is invalid',
    '603':'603: when an NCA needs upgrade',
};
this.dprintstatus = function(r) {
    if(this.debug) {
        console.log("status code: ", r.statusCode,statuscodes[r.statusCode]);
    }
}
this.get = function(url, cb) {
    var base = this.getBase()+"api/v1.0/users/"+this.username;
    url = base + url;
    this.dprint("GET: " + url);
    request.get({url:url, jar:jar},cb);
}

this.post = function(url,cb) {
    var base = this.getBase()+"api/v1.0/users/"+this.username;
    url = base + url;
    this.dprint("POST: " + url);
    request.post({url:url, jar:jar},cb);
}
this.postObj = function(url,obj,cb) {
    var base = this.getBase()+"api/v1.0/users/"+this.username;
    url = base + url;
    this.dprint("POST: " + url);
    request.post({url:url, jar:jar, body:JSON.stringify(obj)},cb);
}
this.putObj = function(url,obj,cb) {
    var base = this.getBase()+"api/v1.0/users/"+this.username;
    url = base + url;
    this.dprint("PUT: " + url);
    request.put({url:url, jar:jar, body:JSON.stringify(obj)},cb);
}
this.postObjWithPort = function(url,port,obj,cb) {
    var base = this.getBase(port)+"api/v1.0/users/"+this.username;
    url = base + url;
    this.dprint("POST: " + url);
    
    var body = JSON.stringify(obj);
    request.post({
        url:url, 
        jar:jar, 
        body: body,
        headers: {
            'content-type' : 'application/json',
            'content-length': body.length
        },        
    },cb);
}


this.login = function(cb) {
    var self = this;
    this.dprint("doing the login post");
    request.get(
        {
            url:self.getBase()+"login/",
            jar:jar,
        },
        function(e,r,body) {
            request.post(
                {
                    url:self.getBase()+"login/?next=/",
                    jar:jar,
                    form: {
                        "next":"/",
                        "username":self.username,
                        "password":self.password,
                    },
                },function(e,r,body){
                    cb(e);
                });
        });
}

function Peripheral(server, device, meta) {
    this.uuid = meta.uuid;
    this.name = meta.name;
    //this.meta = meta;
    this.getServices = function(cb) {
        server.get("/devices/"+device.id+"/Peripherals/"+this.uuid+"/services",function(e,r,body) {
            if(e) { console.log(e); return; }
            if(r.statusCode == 609) {
                console.log("error: 609. peripheral unavailable");
                cb(null);
                return;
            }
            cb(JSON.parse(body).items);
        });
    }
    this.setValue = function(serviceid,body,cb) {
        server.putObj("/devices/"+device.id+"/Peripherals/"+this.uuid+"/services/"+serviceid,
            body,
            function(e,r,body) {
                cb(body);
            }
        );
    }
}
function Device(server,id,struct) {
    this.id = id;
    this.struct = struct;
    this.friendly_name = struct.friendly_name;
    this.status = struct.status;
    var self = this;
    this.getKnownPeripherals = function(cb) {
        server.get("/devices/"+this.id+"/Peripherals/known",function(e,r,body) {
            if(e) {
                console.log("ERROR",e);
                return;
            }
            if(r.statusCode == 600) {
                console.log("error: 600. device unavailable");
                cb(null);
                return;
            }
                
            var pers = JSON.parse(body).peripherals;
            var arr = [];
            for(var i in pers) {
                arr.push(new Peripheral(server,self,pers[i]));
            }
            cb(arr);
        });
    }
    
    
    this.startStopScan = function(cb) {
        var id = this.id;
        server.post("/devices/"+id+"/Peripherals/scan/start",
            function(e,r,body) {
                server.dprint("returned from starting to scan peripherals",e,body);
                server.dprint('waiting for 10 seconds');
                setTimeout(function() {
                    server.post("/devices/"+id+"/Peripherals/scan/stop",
                        function() {
                            server.dprint("stopped scanning",e,body);
                            server.get("/devices/"+id+"/Peripherals",function(e,r,body) {
                                //console.log("done",e,body);
                                var pers = JSON.parse(body).peripherals;
                                var arr = [];
                                for(var i in pers) {
                                    arr.push(new Peripheral(server,self,pers[i]));
                                }
                                console.log("returning");
                                cb(arr);
                            });
                        }
                    );
                }, 10000);
            }
        );
    };
    
    this.getRecipes = function(cb) {
        server.get('/devices/'+this.id+'/Recipe/*', function(e,r,b) {
            server.dprint('status code =',r.statusCode);
            cb(JSON.parse(b).recipes);
        });
    };
    
    this.addRecipe = function(recipe, cb) {
        server.postObj("/devices/"+this.id+"/recipe",recipe,function(e,r,b) {
            server.dprint('status code =',r.statusCode);
            cb(r.statusCode);
        });
    };
    
    
    this.monitorEvents = function(type, cb) {
        var WebSocketClient = require('websocket').client;
        var client = new WebSocketClient();
        client.on('connect',function(connection) {
            server.dprint('connected');
            connection.on('message',function(mess) {
                //console.log("got a message",mess);
                cb(JSON.parse(mess.utf8Data));
            });
        });
        client.on('connectFailed',function(e) {
            server.dprint("connect failed");
        });
        var url = "ws://dev.nokiaconnect.net:19080/api/v1.0/users/marinacci/devices/"+this.id+"/voices/events/"+type;
        console.log("connecting to url",url);
        client.connect(url);
    }
    
    this.getHistoricalEvents = function(query, cb) {
        server.postObjWithPort('/devices/'+this.id+'/voices/reports', 19080, query, function(e,r,b) {
            server.dprintstatus(r);
            cb(JSON.parse(b));
        });
    };
    
    this.submitEvent = function(ev,cb) {
        
        server.postObjWithPort('/devices/'+this.id+'/voices/events', 19090, ev, function(e,r,b) {
                console.log(e,r,b);
            server.dprintstatus(r);
        });

    }
    
}

this.listDevices = function(cb) {
    var self = this;
    this.post("/Devices",function(e,r,body) {
        self.dprintstatus(r);
        var devices = JSON.parse(body).items;
        var arr = []
        devices.forEach(function(dev) {
            arr.push(new Device(self, dev.uuid, dev));
        });
        cb(arr);
    });
};




}

exports.VoicesServer = Server;
