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
exports.checkError = function(gl) {
    var error_map = {};
    error_map[gl.GL_NO_ERROR] = "GL_NO_ERROR";
    error_map[gl.GL_INVALID_ENUM] = "GL_INVALID_ENUM";
    error_map[gl.GL_INVALID_VALUE] = "GL_INVALID_VALUE";
    error_map[gl.GL_INVALID_OPERATION] = "GL_INVALID_OPERATION";
    error_map[gl.GL_OUT_OF_MEMORY] = "GL_OUT_OF_MEMORY";
    var err = gl.glGetError();
    if(err != gl.GL_NO_ERROR) {
        console.log("error = ", err,error_map[err], " line: ",__line);
        return true;
    }
    return false;
}
function printWithLines(src) {
    var i = 1;
    src.split("\n").forEach(function(s) {
        console.log(i + "    " + s);
        i++;
    });
}
exports.loadShader = function(gl,def) {
    var version = gl.glGetString(gl.GL_SHADING_LANGUAGE_VERSION);
    console.log("the  real gl version",version);
    exports.checkError(gl);

    var vsource = "";    
    if(process.platform == "darwin") {
        vsource += "#version 120\n";
    }
    def.uni.forEach(function(uni) {
        vsource += "uniform "+uni.type+" "+uni.name+";\n";
    });
    def['in'].forEach(function(uni) {
        vsource += "attribute "+uni.type+" "+uni.name+";\n";
    });
    def.out.forEach(function(uni) {
        vsource += "varying "+uni.type+" "+uni.name+";\n";
    });
    
    vsource += "void main() {   \n";
    vsource += def.vert.join("\n   ");
    vsource += "\n}\n";
    printWithLines(vsource);
    console.log("vsource = \n----\n",vsource,"----\n");
    
    var vshader = gl.glCreateShader(gl.GL_VERTEX_SHADER);
    gl.glShaderSource(vshader, 1, vsource, null);
    gl.glCompileShader(vshader);
    var status = gl.glGetShaderiv(vshader, gl.GL_COMPILE_STATUS);
    if(status != gl.GL_TRUE) {
        var buffer = gl.glGetShaderInfoLog(vshader);
        console.log("compile error",buffer);
    }
    exports.checkError(gl);
        
    
    var fsource = "";
    if(process.platform == "darwin") {
        fsource += "#version 120\n";
    }
    def.uni.forEach(function(uni) {
        fsource += "uniform "+uni.type+" "+uni.name+";\n";
    });
    def.out.forEach(function(uni) {
        fsource += "varying "+uni.type+" "+uni.name+";\n";
    });
    fsource += "void main() {   \n";
    fsource += def.frag.join("\n   ");
    fsource += "\n}\n";
    console.log("fsource = \n----\n",fsource,"----\n");
    
    var fshader = gl.glCreateShader(gl.GL_FRAGMENT_SHADER);
    //var fsource = fs.readFileSync('tests/gl/frag.glsl');
    gl.glShaderSource(fshader, 1, fsource, null);
    gl.glCompileShader(fshader);
    status = gl.glGetShaderiv(fshader, gl.GL_COMPILE_STATUS);
    exports.checkError(gl);
    if(status != gl.GL_TRUE) {
        var buffer = gl.glGetShaderInfoLog(fshader);
        console.log("compile error",buffer);
    }
    exports.checkError(gl);
        
    var prog = gl.glCreateProgram();
    gl.glAttachShader(prog,vshader);
    gl.glAttachShader(prog,fshader);
    exports.checkError(gl);
    gl.glLinkProgram(prog);
    status = gl.glGetProgramiv(prog,gl.GL_LINK_STATUS);
    if(status != gl.GL_TRUE) {
        var buffer = gl.glGetProgramInfoLog(prog);
        console.log("compile error",buffer);
    }
    
    function sizeof(type) {
        if(type == "vec3") return 3;
        if(type == "vec2") return 2;
        if(type == "float") return 1;
        return 3;
    }
    
    return {
        id: prog,
        use: function() {
            gl.glUseProgram(prog);
        },
        makeVBO: function(verts) {
            this.vbo = gl.glGenBuffers(1);
            gl.glBindBuffer(gl.GL_ARRAY_BUFFER, this.vbo);
            gl.glBufferData(gl.GL_ARRAY_BUFFER, verts, gl.GL_STATIC_DRAW);
            exports.checkError(gl);
        },
        
        bind: function() {
            gl.glBindBuffer(gl.GL_ARRAY_BUFFER, this.vbo);
            exports.checkError(gl);
        },
        
        setupLocations: function() {
            var atts = {};
            def.uni.forEach(function(uni) {
                atts[uni.name] = gl.glGetUniformLocation(prog,uni.name);
            });
            def['in'].forEach(function(uni) {
                atts[uni.name] = gl.glGetAttribLocation(prog,uni.name);
            });
            console.log("locations = ",atts);
            this.atts = atts;
        },
        
        mapMemory: function() {
            var atts = this.atts;
            var totalsize = 0;
            def['in'].forEach(function(input) {
                totalsize += sizeof(input.type);
            });
            var offset = 0;
            def['in'].forEach(function(input) {
                var size = sizeof(input.type);
                gl.glVertexAttribPointer(atts[input.name], size, gl.GL_FLOAT, gl.GL_FALSE, totalsize, offset);
                offset += size;
                gl.glEnableVertexAttribArray(atts[input.name]);
                if(exports.checkError(gl)) {
                    console.log("problem with " + input.name);
                }
            });
        }
    }
};


