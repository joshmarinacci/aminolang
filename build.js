/*
a build system is to:

make sure every part has the things it needs to be built. this includes variables, env, tool installation, etc.

use lazy evaluation and dep management to ensure incremental builds are done properly.

perform common tasks with consise descriptions

next steps:
* create a reusable module that encapsulates all of ometa parsing,
if possible. might need to do some scoping?
* create a newerThan function
* convert the rest of the js and java tests. 
* make sure everything works now.



so I can do:
always input, output, options, callback

    var parserfile = "parsers.js";
    var defsfiles = ["core.def", "controls.def"];
    var outjava = 'build/out.java';
    var outjs = 'build/out.js';

    
    function generateCoreJS() {
        if(newerThan(outjs, [parserfile, defsfiles])) {
            var JoshParser = ometa.loadParser(,"JoshParser");
            var core = fs.readFileSync("core.def","utf8");
            var tree = JoshParser.matchAll(core,'top');
            var code = Josh2JS.matchAll([tree],'blocks');
            fs.writeFileSync('build/out.js,code);
        }
    }

    function generateCoreJava() {
        if(newerThan(outjava, [parserfile, defsfiles])) {
            
        }
    }
    
    function compileJavatests() {
        //do this if code changed. uses filestamps to check.
    }
    function runJavatests() {
        //always do this
    }
    javatests depends on generateCoreJava
*/

var jb = require('./bin/joshbuild');
console.log(jb);

var wrench = require('wrench');
var u = require('util');
var fs = require('fs');
var exec = require('child_process').exec;

require('./bin/ometa.js');
/*
function path(p) {
	return '../ometa-js/'+p;
}
var LIB = require(path('lib.js'));
require(path('ometa-base.js'));
require(path('parser.js'));
require(path('bs-js-compiler.js'));
require(path('bs-ometa-compiler.js'));
var StringBuffer = LIB.StringBuffer;
require(path('bs-ometa-optimizer.js'));
require(path('bs-ometa-js-compiler.js'));
*/
function p(s) { console.log(s); }

var command = process.argv[2];

function Task(fn, dep, name) {
    this.fn = fn;
    this.dep = dep;
    this.name = name;
    this.did = false;
    this.runthis = function(cb) {
        p("["+this.name+"]" + " running");
        var self = this;
        this.fn(function() {
            self.did = true;
            if(cb) cb();
        });
    };
    
    this.run = function(cb) {
        if(this.did) {
            if(cb) cb();
            return;
        }
        if(dep.length > 0) {
            p("["+this.name+"]" + " doing deps: " + dep);
            var self = this;
            rundeps(dep[0], function() {
                    self.runthis(cb);
            });
        } else {
            this.runthis(cb);
        }
    }
}

function rundeps(dep, cb) {
    tasks[dep].run(function() {
        if(cb) cb();
    });
}

function doExec(cmd, cb) {
    p("[EXEC] " + cmd);
    exec(cmd,function(er,out,err) {
        p(out);
        p(err);
        if(cb) cb();
    });
}

var outdir = "build";


function core(cb) {
//    doExec("node generate.js",cb);
    function translateCode(s) {
      var translationError = function(m, i) { 
        console.log("Translation error - please tell Alex about this!"); throw fail 
      };
      
      var tree = BSOMetaJSParser.matchAll(s, "topLevel", undefined, 
          function(m, i) {
              console.log("in failure: " + m + " " + i);
              throw objectThatDelegatesTo(fail, {errorPos: i}) 
          });
      return BSOMetaJSTranslator.match(tree, "trans", undefined, translationError);
    }
    
    function parseit(str) {
        eval(translateCode(str));
    }

    //parse parsers.js
    var parsersjs = fs.readFileSync('src/aminolang/parsers.js','utf8');
    parseit(parsersjs);
    
    var stdDefs = fs.readFileSync('src/aminolang/core.def','utf8');
    stdDefs += fs.readFileSync('src/aminolang/controls.def','utf8');
    var tree = JoshParser.matchAll(stdDefs,'top');
    console.log("parsed defs");
    //console.log(u.inspect(tree,false,20));
    
    var jscode = Josh2JS.matchAll([tree], 'blocks');
    console.log("generated js code");
    
    var jsoutdir = outdir+"/"+"jscanvas";
    jb.mkdir(jsoutdir);
    var jsout = jsoutdir+"/out.js";
    fs.writeFileSync(jsout,jscode);
    console.log("wrote out " + jsout);
    


}

function javacore(cb) {
    var files = [
        "build/out.java",
        "java2d/com/joshondesign/aminogen/generated/*.java",
        "java2d/com/joshondesign/aminogen/custom/*.java",
        "tests/ComponentsTest.java"
    ];
    doExec("javac " +files.join(" ") + " -d build", cb);
}

function compiletest(cb) {
    jb.javac(
        //src files
        [
            "build/out.java",
            "java2d/com/joshondesign/aminogen/generated/CommonObject.java",
            "java2d/com/joshondesign/aminogen/custom/CoreImpl.java",
            "tests/ComponentsTest.java"
        ], 
        //output dir
        "build/java2d/classes",
        //options
        {classpath:null}, 
        //callback
        cb);
}

/*
call java but

java
    infiles
    outfiles
    settings
src = [ "build/out.java", "java2d/com//*.java", "tests/ComponentsTest.java"]
compileJava(src, "build/java2d/classes", {classpath:null})
    
recompile if infiles more recent than outfiles.
how do we know what the outfiles are? 
just use the oldest file in the output dir?

*/

function joglcore(cb) {
    exec("node generatejogl.js",function(er,out,err) {
        p("exec completed");
        p(out);
        p(err);
        
        var files = [
            "joglbuild/out.java",
            "javajogl/com/joshondesign/aminogen/generated/*.java",
            "javajogl/com/joshondesign/aminogen/custom/*.java",
            "tests/ComponentsTest.java"
        ];
        if(!fs.existsSync("joglbuild/compiled")) {
            fs.mkdirSync("joglbuild/compiled");
        }
        var classpath = [
            "/Users/josh/projects/jogamp-all-platforms/jar/gluegen-rt.jar",
            "/Users/josh/projects/jogamp-all-platforms/jar/jogl-all.jar",
        ]
        exec("javac " +files.join(" ") + " -cp " + classpath.join(":")+ " -d joglbuild/compiled", function(er, out,err) {
            p("javac finished");
            p(out);
            p(err);
            if(cb) cb();
        });
    });
    
}

function runjava(cb) {
    doExec("java -cp build ComponentsTest", cb);
}

function runjogl(cb) {
    var classpath = [
        "joglbuild/compiled/",
        "/Users/josh/projects/jogamp-all-platforms/jar/gluegen-rt.jar",
        "/Users/josh/projects/jogamp-all-platforms/jar/jogl-all.jar",
    ];
    doExec("java -cp " + classpath.join(":") + " ComponentsTest", cb);
}

function runjavacore(cb) {
    var files = [
        "build/JavaTester.java"
    ];
    
    exec("javac -cp build " +files.join(" ") + " -d build", function(er, out,err) {
        p("javac finished");
        p(out);
        p(err);
        runit();
    });
    
    
    function runit() {
    exec("java -cp build com.joshondesign.aminogen.custom.JavaTester", function(er, out, err) {
        p("java finished");
        p(out);
        p(err);
        if(cb) cb();
    });
    }
}

function coretests(cb) {
    doExec("node gen_tests.js",cb);
}

function runjscore(cb) {
    doExec("open build/Simple.html",cb);
}

function help(cb) {
    p("Available commands");
    var keys = Object.keys(tasks);
    for(var i in keys) {
        p("   " + keys[i]);
    }
}

tasks = {
    help:       new Task(help,      [],            "Help Info"),
    core:       new Task(core,      [],            "Core AminoLang classes"),
    coretests:  new Task(coretests, ["core"],      "AminoLang tests"),
    javacore:   new Task(javacore,  ["core"],      "Java Core"),
    joglcore:   new Task(joglcore,  [],      "JOGL Java Core"),
    runjava:    new Task(runjava,   ["javacore"],  "running java"),
    runjogl:    new Task(runjogl   ,["joglcore"], "running Java AminoLang Tests"),
    runjscore:  new Task(runjscore, [], "running JS AminoLang Tests"),
    runjavacore:new Task(runjavacore,["coretests"], "running Java AminoLang Tests"),
    testcompile:    new Task(compiletest,[],"compile test"),
}

if(!command) {
    command = "help";
}
rundeps(command);
