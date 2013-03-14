package com.joshondesign.aminogen.custom;

import java.nio.FloatBuffer;
import javax.media.opengl.GL2ES2;

/**
* Created with IntelliJ IDEA.
* User: josh
* Date: 3/11/13
* Time: 2:54 PM
* To change this template use File | Settings | File Templates.
*/
class ColorShader extends Shader {
    private final int attr_pos;
    private final int attr_color;
    private final int u_matrix;
    private final int u_trans;
    private final int program;

    ColorShader(GL2ES2 gl) {
        String vertShaderText =
                "uniform mat4 modelviewProjection;\n"+
                        "uniform mat4 trans;\n"+
                        "attribute vec4 pos;\n"+
                        "attribute vec4 color;\n"+
                        "varying vec4 v_color;\n"+
                        "void main() {\n"+
                        "   gl_Position = modelviewProjection * trans * pos;\n"+
                        "   v_color = color;\n"+
                        "}\n";

        String fragShaderText =
                "varying vec4 v_color;\n"+
                        "void main() {\n"+
                        "   gl_FragColor = v_color;\n"+
                        "}\n";

        int fragShader = compileShader(gl, fragShaderText);
        int vertShader = compileVertShader(gl, vertShaderText);
        program = compileProgram(gl,fragShader, vertShader);
        gl.glUseProgram(program);

        //test setting attrib locations
        attr_pos = gl.glGetAttribLocation(program, "pos");
        attr_color = gl.glGetAttribLocation(program, "color");

        u_matrix = gl.glGetUniformLocation(program,"modelviewProjection");
        u_trans = gl.glGetUniformLocation(program,"trans");
    }

    public void apply(GL2ES2 gl, float[] trans, FloatBuffer verts, FloatBuffer colors) {
        gl.glUseProgram(program);

        //the transform matrix
        //System.out.println("transform = " + trans[12]);
        gl.glUniformMatrix4fv(u_trans, 1, false, trans, 0);

        //the modelview matrix
        float[] rot = VUtils.identityMatrix();
        float sc = Shader.SCALE;
        float[] scale = VUtils.make_scale_matrix(sc,sc,sc);
        float[] mat = VUtils.mul_matrix(rot, scale);
        gl.glUniformMatrix4fv(u_matrix, 1, false, mat, 0);

        //position and colors of the verts
        gl.glVertexAttribPointer(attr_pos, 2, gl.GL_FLOAT, false, 0, verts);
        gl.glVertexAttribPointer(attr_color, 3, gl.GL_FLOAT, false, 0, colors);
        gl.glEnableVertexAttribArray(attr_pos);
        gl.glEnableVertexAttribArray(attr_color);

        //draw it
        gl.glDrawArrays(gl.GL_TRIANGLES, 0, 6);

        //reset
        gl.glDisableVertexAttribArray(attr_pos);
        gl.glDisableVertexAttribArray(attr_color);
    }
}
