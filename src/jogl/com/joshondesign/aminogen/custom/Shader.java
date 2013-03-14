package com.joshondesign.aminogen.custom;

import javax.media.opengl.GL2ES2;
import static javax.media.opengl.GL2ES2.GL_FRAGMENT_SHADER;
import static javax.media.opengl.GL2ES2.GL_LINK_STATUS;
import static javax.media.opengl.GL2ES2.GL_VERTEX_SHADER;

/**
* Created with IntelliJ IDEA.
* User: josh
* Date: 3/11/13
* Time: 2:53 PM
* To change this template use File | Settings | File Templates.
*/
class Shader {
    public static float SCALE = 0.005f;
    protected int compileShader(GL2ES2 gl, String fragShaderText) {
        int fragShader = gl.glCreateShader(GL_FRAGMENT_SHADER);
        gl.glShaderSource(fragShader, 1, new String[]{fragShaderText}, null, 0);
        gl.glCompileShader(fragShader);
        //gl.glGetShaderiv(fragShader, GL_COMPILE_STATUS);
        return fragShader;
    }
    protected int compileVertShader(GL2ES2 gl, String vertShaderText) {
        int vertShader = gl.glCreateShader(GL_VERTEX_SHADER);
        gl.glShaderSource(vertShader, 1, new String[]{vertShaderText}, null, 0);
        gl.glCompileShader(vertShader);
        //gl.glGetShaderiv(vertShader, GL_COMPILE_STATUS, stat, 0);
        return vertShader;
    }
    protected int compileProgram(GL2ES2 gl, int fragShader, int vertShader) {
        int[] stat = new int[1];

        int program = gl.glCreateProgram();
        gl.glAttachShader(program,fragShader);
        gl.glAttachShader(program,vertShader);
        gl.glLinkProgram(program);

        gl.glGetProgramiv(program, GL_LINK_STATUS, stat,0);
        System.out.println("status = " + stat[0]);
        return program;
    }
}
