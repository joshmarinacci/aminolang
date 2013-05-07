var https = require("https");

function getAPI(key ) {
    return {
        api_key: key,
        getAt: function(latitude, longitude, cb) {
        
            var options = {
                host: 'api.forecast.io',
                port: 443,
                path : '/forecast/'+this.api_key+'/'+latitude+','+longitude ,
                method : 'GET'
            };
        
            function getJSON(options, suc, err) {
                var req = https.request(options, function(res) {
                    var content = "";
                    res.on('data', function(d) {
                        content += d;
                    });
                    res.on("end",function(d) {
                        var json = JSON.parse(content);
                        if(suc) suc(json);
                    });
                });
                req.end();
            };
        
        
            getJSON(options,
                function(json) {
                    if(cb) cb(json);
                },
                function(err) {
                    console.log("an error happened");
                }
            );
        }
    };
}

exports.getAPI = getAPI;
