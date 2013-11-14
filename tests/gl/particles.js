var amino = require('amino');
var fs = require('fs');

Object.defineProperty(global, '__stack', {
  get: function(){
    var orig = Error.prepareStackTrace;
    Error.prepareStackTrace = function(_, stack){ return stack; };
    var err = new Error;
    Error.captureStackTrace(err, arguments.callee);
    var stack = err.stack;
    Error.prepareStackTrace = orig;
    return stack;
  }
});

Object.defineProperty(global, '__line', {
  get: function(){
    return __stack[2].getLineNumber();
  }
});
amino.startApp(function(core,stage) {
    console.log("starting");
    
    function frand(min,max) {
        return Math.random()*(max-min) + min;
    }
        
    var pcount = 2000;
    var psize = 8;
    var first = true;
    var verts = [];
    var delay = 0;
    for(var i=0; i<pcount*psize; i+= psize) {
        verts[i+0] = 0; //start x
        verts[i+1] = 0; //start y
        verts[i+2] = frand(0.9,1); //red
        verts[i+3] = frand(0.9,1); //green
        verts[i+4] = frand(0.9,1); //blue
        verts[i+5] = frand(-0.5,0.5); //delta x
        verts[i+6] = frand(0,2); //delta y
        verts[i+7] = delay; //time delay
        delay += 0.01;
    }
    
    var gl = new amino.GLNode();
    var time = 0;
    var prog;
    var vbo;
    
    function checkError(gl) {
        var error_map = {};
        error_map[gl.GL_NO_ERROR] = "GL_NO_ERROR";
        error_map[gl.GL_INVALID_ENUM] = "GL_INVALID_ENUM";
        error_map[gl.GL_INVALID_VALUE] = "GL_INVALID_VALUE";
        error_map[gl.GL_INVALID_OPERATION] = "GL_INVALID_OPERATION";
        error_map[gl.GL_OUT_OF_MEMORY] = "GL_OUT_OF_MEMORY";
        var err = gl.glGetError();
        if(err != gl.GL_NO_ERROR) {
            console.log("error = ", err,error_map[err], " line: ",__line);
        }
    }
    
    var atts = {};
    
    function setup(gl) {
        checkError(gl);
        var version = gl.glGetString(gl.GL_SHADING_LANGUAGE_VERSION);
        console.log("the gl version",version);
        checkError(gl);

        var vsource = fs.readFileSync('tests/gl/vert.glsl');
        var vshader = gl.glCreateShader(gl.GL_VERTEX_SHADER);
        gl.glShaderSource(vshader, 1, vsource, null);
        gl.glCompileShader(vshader);
        var status = gl.glGetShaderiv(vshader, gl.GL_COMPILE_STATUS);
        if(status != gl.GL_TRUE) {
            var buffer = gl.glGetShaderInfoLog(vshader);
            console.log("compile error",buffer);
        }
        checkError(gl);
        
        var fshader = gl.glCreateShader(gl.GL_FRAGMENT_SHADER);
        var fsource = fs.readFileSync('tests/gl/frag.glsl');
        gl.glShaderSource(fshader, 1, fsource, null);
        gl.glCompileShader(fshader);
        status = gl.glGetShaderiv(fshader, gl.GL_COMPILE_STATUS);
        checkError(gl);
        if(status != gl.GL_TRUE) {
            var buffer = gl.glGetShaderInfoLog(fshader);
            console.log("compile error",buffer);
        }
        checkError(gl);
        
        prog = gl.glCreateProgram();
        gl.glAttachShader(prog,vshader);
        gl.glAttachShader(prog,fshader);
        checkError(gl);
        gl.glLinkProgram(prog);
        status = gl.glGetProgramiv(prog,gl.GL_LINK_STATUS);
        if(status != gl.GL_TRUE) {
            var buffer = gl.glGetProgramInfoLog(prog);
            console.log("compile error",buffer);
        }
        gl.glUseProgram(prog);
        console.log("prog = " + prog);
        
        checkError(gl);
        vbo = gl.glGenBuffers(1);
        checkError(gl);
        gl.glBindBuffer(gl.GL_ARRAY_BUFFER, vbo);
        checkError(gl);
        gl.glBufferData(gl.GL_ARRAY_BUFFER, verts, gl.GL_STATIC_DRAW);
        checkError(gl);
        
        
        atts.timeuni = gl.glGetUniformLocation(prog, "time");
        gl.glUniform1f(atts.timeuni, 1.0);
        atts.gravuni = gl.glGetUniformLocation(prog, "gravity");
        gl.glUniform2f(atts.gravuni, 0.5,0.5);
        atts.posatt = gl.glGetAttribLocation(prog,"position");
        atts.colatt = gl.glGetAttribLocation(prog,"incolor");
        atts.delatt = gl.glGetAttribLocation(prog,"delta");
        atts.delayatt = gl.glGetAttribLocation(prog,"delay");
        console.log("locations = ",atts);
    }
    function postSetup(gl) {
        checkError(gl);
        gl.glBindBuffer(gl.GL_ARRAY_BUFFER, vbo);
        checkError(gl);
        gl.glUseProgram(prog);
        checkError(gl);
        gl.glVertexAttribPointer(atts.posatt, 2, gl.GL_FLOAT, gl.GL_FALSE, psize, 0);
        checkError(gl);
        gl.glVertexAttribPointer(atts.colatt, 3, gl.GL_FLOAT, gl.GL_FALSE, psize, 2);
        checkError(gl);
        gl.glVertexAttribPointer(atts.delatt, 2, gl.GL_FLOAT, gl.GL_FALSE, psize, 5);
        checkError(gl);
        gl.glVertexAttribPointer(atts.delayatt, 1, gl.GL_FLOAT, gl.GL_FALSE, psize, 7);
        checkError(gl);
        gl.glEnableVertexAttribArray(atts.posatt);
        checkError(gl);
        gl.glEnableVertexAttribArray(atts.colatt);
        checkError(gl);
        gl.glEnableVertexAttribArray(atts.delatt);
        checkError(gl);
        gl.glEnableVertexAttribArray(atts.delayatt);
        checkError(gl);
        
        checkError(gl);
     //   gl.glPointSize(10);
        gl.glEnable(gl.GL_BLEND);
        gl.glBlendFuncSeparate(gl.GL_SRC_ALPHA, gl.GL_ONE_MINUS_SRC_ALPHA, gl.GL_ONE, gl.GL_ONE);
        gl.glBlendEquation(gl.GL_FUNC_ADD);
//        gl.glBlendEquation(gl.GL_MAX);
        checkError(gl);
    }
    
    function updatePoints(gl) {
        time+=0.01;
        checkError(gl);
        gl.glUniform1f(atts.timeuni,time);
        gl.glUniform2f(atts.gravuni,0.5,-0.2);
        checkError(gl);
        gl.glDrawArrays(gl.GL_POINTS, 0, pcount);
        checkError(gl);
    }
    gl.onrender = function(gl) {
        checkError(gl);
        if(first) {
            first = false;
            setup(gl);
            console.log("doing first");
        }
        postSetup(gl);
        
        updatePoints(gl);
        gl.glBindBuffer(gl.GL_ARRAY_BUFFER, 0);
    }
    
    var group = new amino.ProtoGroup();
    group.add(new amino.ProtoRect().setW(200).setH(500));
    group.add(new amino.ProtoText().setTx(210).setTy(100).setFill("#ff00ff").setText("blah"));
    group.add(new amino.ProtoRect().setW(500).setH(500).setTx(520));
    group.add(gl);
    stage.setRoot(group);
});
