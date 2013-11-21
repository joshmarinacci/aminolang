var amino = require('amino');
var widgets = require('widgets');
var shaderutils = require('./shaderutils.js');

var fs = require('fs');

function frand(min,max) {
    return Math.random()*(max-min) + min;
}
exports.makeApp = function(core,stage) {
    stage.setSize(800,600);
    var gl = new amino.GLNode();
    var group = new amino.ProtoGroup();
    
    var slider = new widgets.Slider()
        .setTy(0).setTx(0).setW(800).setH(20)
        .setMin(0).setMax(1).setValue(0);
    var contrast = 0;
    stage.on("change",slider,function(e) {
        contrast = e.value;
    });
    group.add(gl);
    gl.setScaley(-1).setTy(600);
    group.add(slider);
    
    var iv = new amino.ProtoImageView().setSrc("tests/images/beatles_01.jpg");
    
    var first = true;
    var shader;
    var shader2;
    var written = false;
    
    var shaderDef = {
        uni: [ 
//            { name: "contrast", type: "float" },
            { name: "mvp",      type: "mat4" },
            { name: "trans",    type: "mat4" },
            { name: "tex",      type:"sampler2D" },
        ],
        in: [
            { name: "position", type: "vec2" },
            { name: "texcoords", type:"vec2" },
        ],
        out: [
            { name:"uv", type:"vec2"},
        ],
        vert: [
            "gl_Position = mvp*trans*vec4(position.x,position.y,0.0,1.0);",
            "gl_PointSize = 30;",
            "uv = texcoords;",
        ],
        frag: [
//            "gl_FragColor = vec4(1.0,1.0,0.0,1.0);",
            "gl_FragColor = texture2D(tex,uv);",
        ]
    };
//    gl.setScaley(-1);
//    gl.setTx(30).setTy(700);
    var contrastDef = {
        uni: [ 
            { name: "contrast", type: "float" },
            { name: "mvp",      type: "mat4" },
            { name: "trans",    type: "mat4" },
            { name: "tex",      type:"sampler2D" },
        ],
        in: [
            { name: "position", type: "vec2" },
            { name: "texcoords", type:"vec2" },
        ],
        out: [
            { name:"uv", type:"vec2"},
        ],
        vert: [
            "gl_Position = mvp*trans*vec4(position.x,position.y,0.0,1.0);",
            "gl_PointSize = 30;",
            "uv = texcoords;",
        ],
        frag: [
            "vec4 c = texture2D(tex,uv);",
            "float avg = 0.21*c.r + 0.71*c.g + 0.07*c.b;",
            "float c1 = contrast;",
            "float c2 = 1.0-contrast;",
            "gl_FragColor = vec4(avg*c1 + c.r*c2,avg*c1+c.g*c2,avg*c1+c.b*c2,1.0); ",
        ]
    };
    
    gl.onrender = function(gl) {
        
        shaderutils.checkError(gl);
        var pcount = 4;
        if(first) {
            first = false;
            
            shaderutils.checkError(gl);
            
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
            
            var w = 800;
            var h = 600;
            var pts = [0,0,  0,h,  w,h,  w,h, 0,0, w,0];
            var tx =  [0,1,  0,0,  1,0,  1,0, 0,1, 1,1]; 
            var verts = [];
            for(var i=0; i<pts.length; i+=2) {
                verts.push(pts[i]);
                verts.push(pts[i+1]);
                verts.push(tx[i]);
                verts.push(tx[i+1]);
            }
            shader = shaderutils.loadShader(gl, shaderDef);
            shader.use();
            shader.makeVBO(verts);
            shader.setupLocations();
            shaderutils.checkError(gl);
            
            
            shader2 = shaderutils.loadShader(gl, contrastDef);
            shader2.use();
            shader2.makeVBO(verts);
            shader2.setupLocations();
            shaderutils.checkError(gl);
            console.log("did setup");
        }
        
        //bind to the custom framebuffer
        gl.glBindFramebuffer(gl.GL_FRAMEBUFFER, fb);
        //do first drawing
        shader.bind();
        shader.use();
        shader.mapMemory();
        shaderutils.checkError(gl);
        gl.glActiveTexture(gl.GL_TEXTURE0);
        shaderutils.checkError(gl);
        gl.glBindTexture(gl.GL_TEXTURE_2D, iv.image.texid);
        gl.glEnable(gl.GL_BLEND);
        gl.glBlendFuncSeparate(gl.GL_SRC_ALPHA, gl.GL_ONE_MINUS_SRC_ALPHA, gl.GL_ONE, gl.GL_ONE);
        gl.glBlendEquation(gl.GL_FUNC_ADD);
        gl.setModelView(shader.atts.mvp);
        gl.setGlobalTransform(shader.atts.trans);
        gl.glDrawArrays(gl.GL_TRIANGLES, 0, 6);
        shaderutils.checkError(gl);
        
        //switch back to the main framebuffer and draw again
        gl.glBindFramebuffer(gl.GL_FRAMEBUFFER, 0);
        shaderutils.checkError(gl);
        gl.glActiveTexture(gl.GL_TEXTURE0);
        shaderutils.checkError(gl);
        gl.glBindTexture(gl.GL_TEXTURE_2D, tex);
        shaderutils.checkError(gl);
        //do second draw
        shader2.bind();
        shaderutils.checkError(gl);
        shader2.use();
        shader2.mapMemory();
        shaderutils.checkError(gl);
        gl.glEnable(gl.GL_BLEND);
        gl.glBlendFuncSeparate(gl.GL_SRC_ALPHA, gl.GL_ONE_MINUS_SRC_ALPHA, gl.GL_ONE, gl.GL_ONE);
        gl.glBlendEquation(gl.GL_FUNC_ADD);
        gl.glUniform1f(shader2.atts.contrast,contrast);
        gl.setModelView(shader2.atts.mvp);
        gl.setGlobalTransform(shader2.atts.trans);
        gl.glDrawArrays(gl.GL_TRIANGLES, 0, 6);
        
        //turn off the vertex buffer
        gl.glBindBuffer(gl.GL_ARRAY_BUFFER, 0);
        
        
        var buf = gl.glReadPixels(0,0,800,600,  gl.GL_RGB, gl.GL_UNSIGNED_BYTE);
        if(!written) {
            written = true;
            var Png = require('png').Png;
            var png = new Png(buf, 800, 600, 'rgb');
            var png_image = png.encodeSync();
            
            fs.writeFileSync('./png.png', png_image.toString('binary'), 'binary');
            console.log("wrote out png");
        }
    }
    
    stage.setRoot(group);
}

amino.startApp(exports.makeApp);


