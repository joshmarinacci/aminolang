var amino = require('amino');
var widgets = require('widgets');
var shaderutils = require('./shaderutils.js');

function frand(min,max) {
    return Math.random()*(max-min) + min;
}
exports.makeApp = function(core,stage) {
    stage.setSize(800,600);
    var gl = new amino.GLNode();
    var group = new amino.ProtoGroup();
    
    var slider = new widgets.Slider()
        .setTy(10).setTx(10).setW(900).setH(20)
        .setMin(0).setMax(1).setValue(0);
    var contrast = 0;
    stage.on("change",slider,function(e) {
        contrast = e.value;
        console.log("contrast set to " + contrast);
    });
//    group.add(slider);
    group.add(gl);
    
    var iv = new amino.ProtoImageView().setSrc("tests/images/beatles_01.jpg");
    
    var first = true;
    var shader;
    
    var shaderDef = {
        uni: [ 
//            { name: "contrast", type: "float" },
            { name: "mvp",      type: "mat4" },
            { name: "trans",    type: "mat4" },
//            { name: "tex",      type:"sampler2D" },
        ],
        in: [
            { name: "position", type: "vec2" },
//            { name: "texcoords", type:"vec2" },
        ],
        out: [
//            { name:"uv", type:"vec2"},
        ],
        vert: [
            "gl_Position = mvp*trans*vec4(position.x,position.y,0.0,1.0);",
            "gl_PointSize = 30;",
  //          "uv = texcoords;",
        ],
        frag: [
            "gl_FragColor = vec4(1.0,1.0,0.0,1.0);",
        ]
    };
//    gl.setScaley(-1);
//    gl.setTx(30).setTy(700);
    gl.onrender = function(gl) {
        
        shaderutils.checkError(gl);
        var pcount = 4;
        if(first) {
            first = false;
            
            shaderutils.checkError(gl);
            /*
            //make a framebuffer
            fb = gl.glGenFramebuffers(1);
            shaderutils.checkError(gl);
            console.log(gl.glCheckFramebufferStatus(gl.GL_FRAMEBUFFER) == gl.GL_FRAMEBUFFER_COMPLETE);
            shaderutils.checkError(gl);
            gl.glBindFramebuffer(gl.GL_FRAMEBUFFER, fb);
            shaderutils.checkError(gl);
            
            //make a target texture
            tex = gl.glGenTextures(1);
            gl.glBindTexture(gl.GL_TEXTURE_2D, tex);
            gl.glTexImage2D(gl.GL_TEXTURE_2D, 0, gl.GL_RGB, 800, 600, 0, gl.GL_RGB, gl.GL_UNSIGNED_BYTE, gl.NULL);
            gl.glTexParameteri(gl.GL_TEXTURE_2D, gl.GL_TEXTURE_MIN_FILTER, gl.GL_LINEAR);            
            gl.glTexParameteri(gl.GL_TEXTURE_2D, gl.GL_TEXTURE_MAG_FILTER, gl.GL_LINEAR);            
            shaderutils.checkError(gl);

            gl.glFramebufferTexture2D(gl.GL_FRAMEBUFFER,
                gl.GL_COLOR_ATTACHMENT0, gl.GL_TEXTURE_2D,
                tex,0);
            shaderutils.checkError(gl);
            */
            var verts = [];
            verts[0] = 10;   verts[1] = 10;
            verts[2] = 100;  verts[3] = 10;
            verts[4] = 100;  verts[5] = 100;
            verts[6] = 55;   verts[7] = 55;
            verts[8] = 10;   verts[9] = 100;
            verts[10]= 10;   verts[11]= 10;
            //verts[8] = 0;   verts[9] = 0;
            shader = shaderutils.loadShader(gl, shaderDef);
            shader.use();
            shader.makeVBO(verts);
            shader.setupLocations();
            shaderutils.checkError(gl);
            console.log("did setup");
        }
        shader.bind();
        shader.use();
        shader.mapMemory();
        
        //hack to fix point sprites on mac
        if(process.platform == "darwin") {
//            gl.glEnable(0x8861);
//            gl.glEnable(0x8642);
            //gl.glPointSize(5);
        }
        //end hack

        //bind to the custom framebuffer
//        gl.glBindFramebuffer(gl.GL_FRAMEBUFFER, fb);
        
        shaderutils.checkError(gl);
  
        gl.glEnable(gl.GL_BLEND);
        gl.glBlendFuncSeparate(gl.GL_SRC_ALPHA, gl.GL_ONE_MINUS_SRC_ALPHA, gl.GL_ONE, gl.GL_ONE);
        gl.glBlendEquation(gl.GL_FUNC_ADD);
        
//        gl.glUniform1f(shader.atts.time,time);
//        gl.glUniform2f(shader.atts.gravity,0,0);


        gl.setModelView(shader.atts.mvp);
        gl.setGlobalTransform(shader.atts.trans);
        gl.glDrawArrays(gl.GL_TRIANGLE_FAN, 0, 6);
        shaderutils.checkError(gl);
        //turn off the buffer
        gl.glBindBuffer(gl.GL_ARRAY_BUFFER, 0);
//        gl.glBindFramebuffer(gl.GL_FRAMEBUFFER, 0);
    }
    
    stage.setRoot(group);
}

amino.startApp(exports.makeApp);


