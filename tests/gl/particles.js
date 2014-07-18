var amino = require('amino');
var widgets = require('widgets');
var shaderutils = require('./shaderutils.js');

function frand(min,max) {
    return Math.random()*(max-min) + min;
}

exports.makeApp = function(core,stage) {
    var gl = new amino.GLNode();
    var group = new amino.ProtoGroup();

    var grav = new widgets.Slider()
        .setTy(100).setTx(20).setW(100).setH(20)
        .setMin(-100).setMax(100).setValue(0);
    var gravity = 0;
    stage.on("change",grav,function(e) {
        gravity = e.value/30.0;
    });
    group.add(grav);

    var windNode = new widgets.Slider()
        .setTy(130).setTx(20).setW(100).setH(20)
        .setMin(-100).setMax(100).setValue(0);
    var wind = 0;
    stage.on("change",windNode,function(e) {
        wind = e.value/30.0;
    });
    group.add(windNode);

    group.add(gl);



    var first = true;
    var time = 0;
    var shader;
    gl.onrender = function(gl) {

        shaderutils.checkError(gl);
        var pcount = 2000;
        if(first) {
            first = false;
            var psize = 8;
            var verts = [];
            var delay = 0;
            for(var i=0; i<pcount*psize; i+= psize) {
                verts[i+0] = 0; //start x
                verts[i+1] = 0; //start y
                verts[i+2] = frand(0.9,1); //red
                verts[i+3] = frand(0.9,1); //green
                verts[i+4] = frand(0.9,1); //blue
                verts[i+5] = frand(-0.5,0.5); //delta x
                verts[i+6] = frand(-0.5,0.5); //delta y
                verts[i+7] = delay; //time delay
                delay += 0.01;
            }

            shader = shaderutils.loadShader(gl, {
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
                    { name: "delay",    type: "float" },
                ],
                out: [
                    { name: "v_color",  type: "vec3" },
                    { name: "ftime",    type: "float" },
                ],
                vert: [
                    "float rtime = time-delay;",
                    "if(rtime < 0.0) { rtime = 0.0; }",
                    "rtime = mod(rtime,4.0);",
                    "float tx = position.x + delta.x*rtime + gravity.x*rtime*rtime;",
                    "float ty = position.y + delta.y*rtime + gravity.y*rtime*rtime;",
                    "gl_Position = mvp*trans*vec4(tx*100.0, ty*100.0, 0.0, 1.0);",
                    "v_color = incolor;",
                    "ftime = rtime;",
                    "gl_PointSize = 30.0;",
                ],
                frag: [
                    "vec4 color = vec4(v_color.r, v_color.g, v_color.b, 1.0);",
                    "float a = 1.0-ftime/3.0;",
                    "float b = max(0.0, 1.0-2.0*length(gl_PointCoord - 0.5));",
                    "color.a = b;",
                    "gl_FragColor = color;",
                ]
            });


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
            gl.glPointSize(50);
        }
        //end hack

        gl.glEnable(gl.GL_BLEND);
        gl.glBlendFuncSeparate(gl.GL_SRC_ALPHA, gl.GL_ONE_MINUS_SRC_ALPHA, gl.GL_ONE, gl.GL_ONE);
        gl.glBlendEquation(gl.GL_FUNC_ADD);

        time+=0.01;
        gl.glUniform1f(shader.atts.time,time);
        //gl.glUniform2f(shader.atts.gravity,wind,gravity);
        gl.glUniform2f(shader.atts.gravity,wind,gravity);


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

    gl.setTx(200).setTy(100);
    return group;
//    stage.setRoot(group);
}

//amino.startApp(exports.makeApp);
