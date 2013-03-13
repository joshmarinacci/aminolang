var fs = require('fs');
var wrench = require('wrench');
var exec = require('child_process').exec;

function javac(src, dir, opts, cb) {
    var recomp = false;
    if(!fs.existsSync(dir)) {
        wrench.mkdirSyncRecursive(dir);
        recomp = true;
    }
    
    var outdirstats = fs.statSync(dir);
    var oldestOut = outdirstats.mtime;
    
    wrench.readdirSyncRecursive(dir).forEach(function(f) {
        var mtime = fs.statSync(dir + "/"+f).mtime;
        if(mtime > oldestOut) {
            oldestOut = mtime;
        }
    });
    
    var newestIn = 0;
    src.forEach(function(f) {
        var stats = fs.statSync(f);
        if(stats.mtime > newestIn) {
            newestIn = stats.mtime;
        }
    });
    
    //    console.log("newest input  = " + newestIn);
    //    console.log("oldest output = " + oldestOut);
    if(newestIn > oldestOut) {
        recomp = true;
    }
    if(recomp) {
        doExec("javac " + src.join(" ") + " -d " + dir, cb);
    }
}

function doExec(cmd, cb) {
    p("[EXEC] " + cmd);
    exec(cmd,function(er,out,err) {
        p(out);
        p(err);
        if(cb) cb();
    });
}

function p(s) { console.log(s); }

function mkdir(dir) {
    if(!fs.existsSync(dir)) {
        wrench.mkdirSyncRecursive(dir);
    }
}

exports.javac = javac;
exports.mkdir = mkdir;
