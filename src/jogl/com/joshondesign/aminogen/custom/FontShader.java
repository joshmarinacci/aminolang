package com.joshondesign.aminogen.custom;

import com.jogamp.common.nio.Buffers;
import com.jogamp.opengl.util.texture.Texture;
import com.jogamp.opengl.util.texture.TextureIO;
import java.io.File;
import java.io.IOException;
import java.nio.FloatBuffer;
import static javax.media.opengl.GL.GL_TEXTURE0;
import static javax.media.opengl.GL.GL_TEXTURE_2D;
import javax.media.opengl.GL2ES2;

import com.joshondesign.aminogen.custom.CoreImpl.Bounds;

public class FontShader extends Shader {

    private final int program;
    private final int attr_pos;
    private final int attr_texcoords;
    private final int attr_tex;
    private final int u_matrix;
    private final int u_trans;
    private Texture mainTexture;
    private final int[] keys;
    private final double[] offsets;

    public FontShader(GL2ES2 gl) {
       keys = new int[] {-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,63,72,-1,74,75,76,78,68,80,81,79,83,64,84,65,66,53,54,55,56,57,58,59,60,61,62,-1,67,-1,85,-1,-1,73,0,1,2,3,4,5,6,7,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,69,71,70,77,82,-1,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,};
       offsets = new double[] {0.0,15.0,17.0,16.0,35.0,15.0,52.0,17.0,71.0,13.0,86.0,12.0,100.0,17.0,119.0,18.0,139.0,18.0,159.0,7.0,168.0,6.0,176.0,15.0,193.0,12.0,207.0,22.0,231.0,18.0,251.0,19.0,272.0,14.0,288.0,19.0,309.0,15.0,326.0,13.0,341.0,13.0,356.0,17.0,375.0,14.0,391.0,22.0,415.0,14.0,431.0,13.0,446.0,14.0,462.0,13.0,477.0,15.0,494.0,11.0,507.0,15.0,524.0,13.0,539.0,8.0,549.0,13.0,564.0,15.0,581.0,6.0,589.0,6.0,597.0,13.0,612.0,6.0,620.0,22.0,644.0,15.0,661.0,14.0,677.0,15.0,694.0,15.0,711.0,10.0,723.0,11.0,736.0,8.0,746.0,15.0,763.0,12.0,777.0,19.0,798.0,13.0,813.0,12.0,827.0,11.0,840.0,14.0,856.0,14.0,872.0,14.0,888.0,14.0,904.0,14.0,920.0,14.0,936.0,14.0,952.0,14.0,968.0,14.0,984.0,14.0,1000.0,6.0,1008.0,6.0,1016.0,6.0,1024.0,9.0,1035.0,6.0,1043.0,5.0,1050.0,8.0,1060.0,8.0,1070.0,9.0,1081.0,6.0,1089.0,22.0,1113.0,16.0,1131.0,14.0,1147.0,20.0,1169.0,13.0,1184.0,18.0,1204.0,13.0,1219.0,7.0,1228.0,7.0,1237.0,11.0,1250.0,14.0,1266.0,8.0,1276.0,14.0,};

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
                        "vec4 texel = texture2D(tex, uv);\n"+
                        "if(texel.a <= 0.01) { discard; }\n"+
                        "gl_FragColor = vec4(texel.a,texel.a,texel.a,texel.a);\n"+
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
            mainTexture = TextureIO.newTexture(new File("tests/font.png"), true);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public void apply(GL2ES2 gl, float[] transform, String text) {
        //String text = "AbC";
        //turn on the program
        gl.glUseProgram(program);
        //set the texture
        gl.glUniform1i(attr_tex, 0);

        //set the transform matrix
        gl.glUniformMatrix4fv(u_trans, 1, false, transform, 0);

        //calculate the view matrix
        float[] rot = VUtils.identityMatrix();
        float sc = Shader.SCALE;
        float[] scale = VUtils.make_scale_matrix(sc,sc,sc);
        float[] mat = VUtils.mul_matrix(rot, scale);
        gl.glUniformMatrix4fv(u_matrix, 1, false, mat, 0);

        float charX = 0;
        for(int i=0; i<text.length(); i++) {
            int ch = text.charAt(i);
            int n = keys[ch];
            float cho = (float) offsets[n*2];
            float chw = (float) offsets[n*2+1];
            //p("drawing " + ch + " " + (char)ch + " key = " + n + " width = " + chw + " " + cho + " ");
            float iw = mainTexture.getImageWidth();
            float ih = mainTexture.getImageHeight();

            float tx  = cho/iw;
            float ty  = 7/ih;
            float tx2 = (cho+chw)/iw;
            float ty2 = 25/ih;

            FloatBuffer texcoords = Buffers.newDirectFloatBuffer(new float[]{
                    tx, ty,
                    tx2, ty,
                    tx2, ty2,
                    tx2, ty2,
                    tx, ty2,
                    tx, ty
            });

            //set the texture coordinates
            gl.glVertexAttribPointer(attr_texcoords, 2, gl.GL_FLOAT, false, 0, texcoords);
            gl.glEnableVertexAttribArray(attr_texcoords);


            Bounds bounds = new Bounds(charX,0,chw,17);
            float x = (float)bounds.getX();
            float y = (float)bounds.getY();
            float x2 = (float)bounds.getX2();
            float y2 = (float)bounds.getY2();
            FloatBuffer verts = Buffers.newDirectFloatBuffer(new float[]{
                    x, y,
                    x2, y,
                    x2, y2,
                    x2, y2,
                    x, y2,
                    x, y
            });
            //set the vertices
            gl.glVertexAttribPointer(attr_pos, 2, gl.GL_FLOAT, false, 0, verts);
            gl.glEnableVertexAttribArray(attr_pos);
            //set the active texture
            gl.glActiveTexture(GL_TEXTURE0);
            gl.glBindTexture(GL_TEXTURE_2D,mainTexture.getTextureObject(gl));
            //draw it
            gl.glDrawArrays(gl.GL_TRIANGLES, 0, 6);
            charX += chw;
        }

    }

    private void p(String s) {
        System.out.println(s);
    }
}
