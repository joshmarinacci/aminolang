package com.joshondesign.aminogen.custom;

import com.jogamp.opengl.util.texture.Texture;
import com.jogamp.opengl.util.texture.TextureIO;
import java.io.File;
import java.io.IOException;
import java.nio.FloatBuffer;
import static javax.media.opengl.GL.GL_TEXTURE0;
import static javax.media.opengl.GL.GL_TEXTURE_2D;
import javax.media.opengl.GL2ES2;

class TextureShader extends Shader {
    private final int attr_pos;
    private final int u_matrix;
    private final int u_trans;
    Texture mainTexture;
    private final int attr_tex;
    private final int attr_texcoords;
    private final int program;

    TextureShader(GL2ES2 gl) {
        String vertShaderText =
                "uniform mat4 modelviewProjection;\n"+
                "uniform mat4 trans;\n"+
                "attribute vec4 pos;\n"+
                "attribute vec2 texcoords;\n"+
                "varying vec2 uv;\n"+
                "void main() {\n"+
                "   gl_Position = modelviewProjection * trans * pos;\n"+
                "   uv = texcoords;\n"+
                "}\n";

        String fragShaderText =
                "varying vec2 uv;\n"+
                "uniform sampler2D tex;\n"+

                "void main() {\n"+
                        "gl_FragColor = texture2D(tex, uv);\n"+
                "}\n";

        int fragShader = compileShader(gl, fragShaderText);
        int vertShader = compileVertShader(gl, vertShaderText);
        program = compileProgram(gl,fragShader, vertShader);
        gl.glUseProgram(program);

        gl.glEnable(GL2ES2.GL_TEXTURE_2D);

        attr_pos = gl.glGetAttribLocation(program, "pos");
        attr_texcoords = gl.glGetAttribLocation(program, "texcoords");
        attr_tex = gl.glGetUniformLocation(program, "tex");

        u_matrix = gl.glGetUniformLocation(program,"modelviewProjection");
        u_trans = gl.glGetUniformLocation(program,"trans");

        try {
            File tfile = new File("tests/skin.png");
            System.out.println("loading texture " + tfile.getAbsolutePath());
            mainTexture = TextureIO.newTexture(tfile, true);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public void apply(GL2ES2 gl, float[] trans, FloatBuffer verts, FloatBuffer texcoords) {
        //turn on the program
        gl.glUseProgram(program);
        gl.glUniform1i(attr_tex, 0);

        //calculate the transform matrix
        gl.glUniformMatrix4fv(u_trans, 1, false, trans, 0);

        //calculate the view matrix
        float[] rot = VUtils.identityMatrix();
        float sc = Shader.SCALE;
        float[] scale = VUtils.make_scale_matrix(sc,sc,sc);
        float[] mat = VUtils.mul_matrix(rot, scale);
        gl.glUniformMatrix4fv(u_matrix, 1, false, mat, 0);

        //set the vertices
        gl.glVertexAttribPointer(attr_pos, 2, gl.GL_FLOAT, false, 0, verts);
        gl.glEnableVertexAttribArray(attr_pos);
        //set the texture coordinates
        gl.glVertexAttribPointer(attr_texcoords, 2, gl.GL_FLOAT, false, 0, texcoords);
        gl.glEnableVertexAttribArray(attr_texcoords);

        //set the active texture
        gl.glActiveTexture(GL_TEXTURE0);
        gl.glBindTexture(GL_TEXTURE_2D,mainTexture.getTextureObject(gl));

        //draw it
        gl.glDrawArrays(gl.GL_TRIANGLES, 0, 6);

    }
}
