var amino = require('amino');
var fs = require('fs');
amino.startApp(function(core,stage) {
    console.log("starting");
    
    function frand(min,max) {
        return Math.random()*(max-min) + min;
    }
        
    var pcount = 20000;
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
    var timeuni;
    var gravuni;
    var time = 0;
    var prog;
    var vao;
    var vbo;
    
    function setup(gl) {
        var version = gl.glGetString(gl.GL_SHADING_LANGUAGE_VERSION);
        console.log("gl version",version);

        vao = gl.glGenVertexArrays(1);
        gl.glBindVertexArray(vao);

        var vsource = fs.readFileSync('tests/gl/vert.glsl');
        var vshader = gl.glCreateShader(gl.GL_VERTEX_SHADER);
        console.log("vshader = ",vshader);
        gl.glShaderSource(vshader, 1, vsource, null);
        console.log("compling");
        gl.glCompileShader(vshader);
        var status = gl.glGetShaderiv(vshader, gl.GL_COMPILE_STATUS);
        console.log("status = ",status);
        if(status != gl.GL_TRUE) {
            var buffer = gl.glGetShaderInfoLog(vshader);
            console.log("compile error",buffer);
        }
        
        var fshader = gl.glCreateShader(gl.GL_FRAGMENT_SHADER);
        console.log("fshader = ", fshader);
        var fsource = fs.readFileSync('tests/gl/frag.glsl');
        gl.glShaderSource(fshader, 1, fsource, null);
        gl.glCompileShader(fshader);
        console.log("checking for errors");
        status = gl.glGetShaderiv(fshader, gl.GL_COMPILE_STATUS);
        console.log("status = ",status);
        if(status != gl.GL_TRUE) {
            var buffer = gl.glGetShaderInfoLog(fshader);
            console.log("compile error",buffer);
        }
        
        prog = gl.glCreateProgram();
        gl.glAttachShader(prog,vshader);
        gl.glAttachShader(prog,fshader);
        gl.glLinkProgram(prog);
        gl.glUseProgram(prog);
        
        vbo = gl.glGenBuffers(1);
        gl.glBindBuffer(gl.GL_ARRAY_BUFFER, vbo);
        gl.glBufferData(gl.GL_ARRAY_BUFFER, verts, gl.GL_STATIC_DRAW);
        
        
        timeuni = gl.glGetUniformLocation(prog, "time");
        gl.glUniform1f(timeuni, 1.0);
        gravuni = gl.glGetUniformLocation(prog, "gravity");
        gl.glUniform2f(gravuni, 0.5,0.5);
    }
    function postSetup(gl) {
        var posatt = gl.glGetAttribLocation(prog,"position");
        var colatt = gl.glGetAttribLocation(prog,"color");
        var delatt = gl.glGetAttribLocation(prog,"delta");
        var delayatt = gl.glGetAttribLocation(prog,"delay");

        gl.glEnableVertexAttribArray(posatt);
        gl.glVertexAttribPointer(posatt, 2, gl.GL_FLOAT, gl.GL_FALSE, psize, 0);
        gl.glEnableVertexAttribArray(colatt);
        gl.glVertexAttribPointer(colatt, 3, gl.GL_FLOAT, gl.GL_FALSE, psize, 2);
        gl.glEnableVertexAttribArray(delatt);
        gl.glVertexAttribPointer(delatt, 2, gl.GL_FLOAT, gl.GL_FALSE, psize, 5);
        gl.glEnableVertexAttribArray(delayatt);
        gl.glVertexAttribPointer(delayatt, 1, gl.GL_FLOAT, gl.GL_FALSE, psize, 7);
        
        gl.glPointSize(50);
        gl.glEnable(gl.GL_BLEND);
        gl.glBlendFunc(gl.GL_SRC_ALPHA, gl.GL_ONE_MINUS_SRC_ALPHA);
        gl.glBlendEquation(gl.GL_MAX);
    }
    
    function updatePoints(gl) {
        time+=0.01;
        gl.glUniform1f(timeuni,time);
        gl.glUniform2f(gravuni,0.0,-0.5);
        gl.glDrawArrays(gl.GL_POINTS, 0, pcount);
    }
    gl.onrender = function(gl) {
        if(first) {
            first = false;
            setup(gl);
        }
        postSetup(gl);
        
        updatePoints(gl);
    }
    stage.setRoot(gl);
});
