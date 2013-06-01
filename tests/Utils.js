var HTTP = require('http');
var URL = require('url');
var child_process = require('child_process');

function getJSON(url, callback) {
    var options = URL.parse(url);
    console.log("getting: ", options);
    var req = HTTP.request(options,function(res) {
            var content = "";
            res.on('data',function(d) {
                    content+= d;
            });
            res.on('end',function(d) {
                    var json = JSON.parse(content);
                    if(callback) callback(null,json);
            });
    });
    req.end();
}

function openBrowser(url) {
    console.log("opening a browser");
    child_process.spawn('open', [url]);
}
exports.getJSON = getJSON;
exports.openBrowser = openBrowser;
