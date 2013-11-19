var amino = require('amino');
var widgets = require('widgets');
var shaderutils = require('./shaderutils.js');

function frand(min,max) {
    return Math.random()*(max-min) + min;
}
exports.makeApp = function(core,stage) {
    stage.setSize(1024,768);
    var gl = new amino.GLNode();
    var group = new amino.ProtoGroup();
    
    var timeSlider = new widgets.Slider()
        .setTy(10).setTx(10).setW(900).setH(20)
        .setMin(0).setMax(10).setValue(0);
    var time = 0;
    stage.on("change",timeSlider,function(e) {
        time = e.value;
    });
    group.add(timeSlider);
    group.add(gl);
    
    var first = true;
    var time = 0;
    var shader;
    
    var shaderDef = {
        uni: [ 
            { name: "time",     type: "float" },
            { name: "gravity",  type: "vec2" },
            { name: "mvp",      type: "mat4" },
            { name: "trans",    type: "mat4" },
        ],
        in: [
            { name: "position", type: "vec2" },
            { name: "incolor",  type: "vec3" },
            { name: "delta",    type: "vec2" },
            { name: "size",     type: "float" },
        ],
        out: [
            { name: "v_color",  type: "vec3" },
            { name: "ftime",    type: "float" },
        ],
        vert: [
            "float rtime = time;",
            "if(rtime < 0.0) { rtime = 0.0; }",
            "rtime = mod(rtime,10.0);",
            "float tx = position.x + delta.x*rtime + gravity.x*rtime*rtime;",
            "float ty = position.y + delta.y*rtime + gravity.y*rtime*rtime;",
            "gl_Position = mvp*trans*vec4(tx*100.0, ty*100.0, 0.0, 1.0);",
            "v_color = incolor;",
            "ftime = rtime;",
            "gl_PointSize = 3.0+size*time/5.0;",
        ],
        frag: [
            "vec4 color = vec4(v_color.r, v_color.g, v_color.b, 1.0);",
            "float a = 1.0-ftime/3.0;",
            "float rad = length(gl_PointCoord - 0.5);",
            "float b = max(0.0, 1.0-2.0*rad);",
            "color.a = step(rad,0.5)*0.9;",
            "gl_FragColor = color;",
        ]
    };
    gl.setScaley(-1);
    gl.setTx(30).setTy(700);
    gl.onrender = function(gl) {
        
        shaderutils.checkError(gl);
        var pcount = 20000;
        if(first) {
            first = false;
            var psize = 8;
            var verts = [];
            var delay = 0;
            for(var i=0; i<pcount*psize; i+= psize) {
                verts[i+0] = frand(0,1); //start x
                verts[i+1] = frand(0,1); //start y
                verts[i+2] = frand(0.2,1); //red
                verts[i+3] = 0;//frand(0); //green
                verts[i+4] = 0;//frand(0.9,1); //blue
                verts[i+5] = frand(0.0,5.0); //delta x
                verts[i+6] = frand(0.0,5.0); //delta y
                verts[i+7] = frand(10,30);//delay; //time delay
                delay += 0.01;
            }
            
            shader = shaderutils.loadShader(gl, shaderDef);
                        
            
            shader.use();
            shader.makeVBO(verts);
            shader.setupLocations();
        }
        shader.bind();
        shader.use();
        shader.mapMemory();
        
        //hack to fix point sprites on mac
        if(process.platform == "darwin") {
            gl.glEnable(0x8861);
            gl.glEnable(0x8642);
            //gl.glPointSize(5);
        }
        //end hack
        
        gl.glEnable(gl.GL_BLEND);
        gl.glBlendFuncSeparate(gl.GL_SRC_ALPHA, gl.GL_ONE_MINUS_SRC_ALPHA, gl.GL_ONE, gl.GL_ONE);
        gl.glBlendEquation(gl.GL_FUNC_ADD);
        
        gl.glUniform1f(shader.atts.time,time);
        gl.glUniform2f(shader.atts.gravity,0,0);


        var x = this.getTx();
        var y = this.getTy();
        var t = this;
        while(t.parent != null) {
            t = t.parent;
            x += t.getTx();
            y += t.getTy();
        }
        
        //console.log('trans = ',x,y);
        gl.setModelView(shader.atts.mvp);
        gl.setGlobalTransform(shader.atts.trans);
        gl.glDrawArrays(gl.GL_POINTS, 0, pcount);
        //turn off the buffer
        gl.glBindBuffer(gl.GL_ARRAY_BUFFER, 0);
    }
    
    stage.setRoot(group);
}

amino.startApp(exports.makeApp);


