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

var wrench = require('wrench');
var u = require('util');
var fs = require('fs');
var exec = require('child_process').exec;
require('./bin/ometa.js');

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


//generate java2d code from the def files
//can probably share this with JOGL too
function java2dgen(cb) {
    var parsersjs = fs.readFileSync('src/aminolang/parsers.js','utf8');
    parseit(parsersjs);
    var stdDefs = fs.readFileSync('src/aminolang/core.def','utf8');
    stdDefs += fs.readFileSync('src/aminolang/controls.def','utf8');
    stdDefs += fs.readFileSync('src/aminolang/tests.def','utf8');
    var tree = JoshParser.matchAll(stdDefs,'top');
    console.log("parsed defs");
    console.log(u.inspect(tree,false,20));
    
    {
        //java code
        var java2dcode = Josh2Java.matchAll([tree], 'blocks');
        console.log("generated java code");
        var java2doutdir = outdir+"/"+"java2d";
        jb.mkdir(java2doutdir);
        var java2dout = java2doutdir+"/out.java";
        
        var javatemplate = fs.readFileSync('src/java2d/template_java','utf8');
        javatemplate = javatemplate.replace("${test}",java2dcode);
        
        fs.writeFileSync(java2dout, javatemplate);
        console.log("wrote out " + java2dout);
    }
    
    if(cb) cb();
}

function joglgen(cb) {
    var parsersjs = fs.readFileSync('src/aminolang/parsers.js','utf8');
    parseit(parsersjs);
    var stdDefs = fs.readFileSync('src/aminolang/core.def','utf8');
    stdDefs += fs.readFileSync('src/aminolang/controls.def','utf8');
    stdDefs += fs.readFileSync('src/aminolang/tests.def','utf8');
    var tree = JoshParser.matchAll(stdDefs,'top');
    console.log("parsed defs");
    //console.log(u.inspect(tree,false,20));
    
    {
        //java code
        var joglcode = Josh2Java.matchAll([tree], 'blocks');
        console.log("generated java jogl code");
        var joutdir = outdir+"/"+"jogl";
        jb.mkdir(outdir);
        var outfile = joutdir+"/out.java";
        
        var javatemplate = fs.readFileSync('src/java2d/template_java','utf8');
        javatemplate = javatemplate.replace("${test}",joglcode);
        
        fs.writeFileSync(outfile, javatemplate);
        console.log("wrote out " + outfile);
    }
    
    if(cb) cb();
}

function jscanvasgen(cb) {
    var parsersjs = fs.readFileSync('src/aminolang/parsers.js','utf8');
    parseit(parsersjs);
    var stdDefs = fs.readFileSync('src/aminolang/core.def','utf8');
    stdDefs += fs.readFileSync('src/aminolang/controls.def','utf8');
    stdDefs += fs.readFileSync('src/aminolang/tests.def','utf8');
    var tree = JoshParser.matchAll(stdDefs,'top');
    console.log("parsed defs");
    console.log(u.inspect(tree,false,20));
    {
        //js code    
        var jscode = Josh2JS.matchAll([tree], 'blocks');
        console.log("generated js code");
        var jsoutdir = outdir+"/"+"jscanvas";
        jb.mkdir(jsoutdir);
        var jsout = jsoutdir+"/out.js";
        fs.writeFileSync(jsout,jscode);
        console.log("wrote out " + jsout);
    }
    if(cb) cb();
}




function core(cb) {
    //    doExec("node generate.js",cb);

    //parse parsers.js
    var parsersjs = fs.readFileSync('src/aminolang/parsers.js','utf8');
    parseit(parsersjs);
    
    var stdDefs = fs.readFileSync('src/aminolang/core.def','utf8');
    stdDefs += fs.readFileSync('src/aminolang/controls.def','utf8');
    var tree = JoshParser.matchAll(stdDefs,'top');
    console.log("parsed defs");
    console.log(u.inspect(tree,false,20));

    /*
    {
        //js code    
        var jscode = Josh2JS.matchAll([tree], 'blocks');
        console.log("generated js code");
        var jsoutdir = outdir+"/"+"jscanvas";
        jb.mkdir(jsoutdir);
        var jsout = jsoutdir+"/out.js";
        fs.writeFileSync(jsout,jscode);
        console.log("wrote out " + jsout);
    }
    


    {
        //java code
        var java2dcode = Josh2Java.matchAll([tree], 'blocks');
        console.log("generated java code");
        var java2doutdir = outdir+"/"+"java2d";
        jb.mkdir(java2doutdir);
        var java2dout = java2doutdir+"/out.java";
        
        var javatemplate = fs.readFileSync('src/java2d/template_java','utf8');
        javatemplate = javatemplate.replace("${test}",java2dcode);
        
        fs.writeFileSync(java2dout, javatemplate);
        console.log("wrote out " + java2dout);
    }
    */
    
    /*
    {
        //C++ code
        var code = Amino2CPP.matchAll([tree], 'blocks');
        //console.log(code);
        
        var cppoutdir = outdir+"/cpp/";
        jb.mkdir(cppoutdir);
        fs.writeFileSync(cppoutdir+"out.h",
            '#include <string>\n'+
            '#include <vector>\n'+
            'using namespace std;'+
            Amino2CPP.getHFile());
        fs.writeFileSync(cppoutdir+"out.cpp",
            '#include "out.h"\n'+
            Amino2CPP.getCPPFile());
    }
    */
    
    if(cb) cb();
}



function java2dcompile(cb) {
    console.log("doing the java2d core now");
    var files = [
        "build/java2d/out.java",
        "src/java2d/com/joshondesign/aminogen/generated/CommonObject.java",
        "src/java2d/com/joshondesign/aminogen/custom/CoreImpl.java",
        "src/java2d/com/joshondesign/aminogen/custom/Controls.java",
        "src/java2d/com/joshondesign/aminogen/custom/TestRunner.java",
        "tests/General.java",
    ];
    var outdir = "build/java2d/classes";
    //the javac task can't handle *.java paths yet
    jb.javac(files, outdir, { classpath: null},cb);
}

function joglcompile(cb) {
    var files = [
        "build/jogl/out.java",
        "src/jogl/com/joshondesign/aminogen/generated/CommonObject.java",
        "src/jogl/com/joshondesign/aminogen/custom/CoreImpl.java",
        "src/jogl/com/joshondesign/aminogen/custom/Shader.java",
        "src/jogl/com/joshondesign/aminogen/custom/ColorShader.java",
        "src/jogl/com/joshondesign/aminogen/custom/TextureShader.java",
        "src/jogl/com/joshondesign/aminogen/custom/FontShader.java",
        "src/jogl/com/joshondesign/aminogen/custom/Insets.java",
        "src/jogl/com/joshondesign/aminogen/custom/VUtils.java",
        "tests/General.java",
    ];
    var outdir = "build/jogl/classes";
    var classpath = [
        "/Users/josh/projects/jogamp-all-platforms/jar/gluegen-rt.jar",
        "/Users/josh/projects/jogamp-all-platforms/jar/jogl-all.jar",
    ];
    jb.javac(files,outdir,{classpath:classpath.join(":")},cb);
}


function copyFileTo(file, dir) {
    var filename = file.substring(file.lastIndexOf('/'));
    var temp = fs.readFileSync(file);
    var outpath = dir+filename;
    console.log("copying to " + outpath);
    fs.writeFileSync(outpath,temp);
    
}

function jscanvastest(cb) {
    copyFileTo('src/jscanvas/TestRunner.html','build/jscanvas');
    copyFileTo('src/jscanvas/init.js','build/jscanvas');
    copyFileTo('src/jscanvas/handcoded7.js','build/jscanvas');
    copyFileTo('src/jscanvas/monkeypatch.js','build/jscanvas');
}



function java2dtest(cb) {
    jb.exec("java -cp build/java2d/classes com.joshondesign.aminogen.custom.TestRunner com.joshondesign.aminogen.generated.out.SimpleTest", cb);
}
function java2dtest2(cb) {
    jb.exec("java -cp build/java2d/classes General", cb);
}

function jogltest(cb) {
    var classpath = [
        "build/jogl/classes",
        "/Users/josh/projects/jogamp-all-platforms/jar/gluegen-rt.jar",
        "/Users/josh/projects/jogamp-all-platforms/jar/jogl-all.jar",
    ];
    doExec("java -cp " + classpath.join(":") + " General", cb);
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
    help:        new Task(help,       [],            "Help Info"),
  //  core:        new Task(core,       [],            "Core AminoLang classes"),
  
    java2dgen:      new Task(java2dgen,      [],                      "Generate Java2D Core"),
    java2dcompile:  new Task(java2dcompile,  ["java2dgen"],           "Compile Java2D Core"),
    java2dtest:     new Task(java2dtest,     ["java2dcompile"],       "Compile and Run Java2D tests"),
    java2dtest2:    new Task(java2dtest2,    ["java2dcompile"],       "Compile and Run Java2D tests, 2"),
    
    joglgen:      new Task(joglgen,        [],                      "Generate JOGL Core"),
    joglcompile:  new Task(joglcompile,  ["joglgen"],           "Compile JOGL Core"),
    jogltest:     new Task(jogltest,     ["joglcompile"],       "Test JOGL"),
//    jogltest2:    new Task(java2dtest2,    ["java2dcompile"],       "Compile and Run Java2D tests, 2"),
    
    jscanvasgen:    new Task(jscanvasgen,    [],                      "Generate JavaScript Canvas Core"),
    jscanvastest:   new Task(jscanvastest,   ["jscanvasgen"],         "Test JS Canvas"),
//    joglcore:    new Task(joglcore,   [],            "Compile JOGL Java Core"),
    /*
    coretests:  new Task(coretests, ["core"],      "AminoLang tests"),
    runjogl:    new Task(runjogl   ,["joglcore"], "running Java AminoLang Tests"),
    runjscore:  new Task(runjscore, [], "running JS AminoLang Tests"),
    runjavacore:new Task(runjavacore,["coretests"], "running Java AminoLang Tests"),
    testcompile:    new Task(compiletest,[],"compile test"),
    */
}

if(!command) {
    command = "help";
}
rundeps(command);
