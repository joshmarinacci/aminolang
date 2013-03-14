package com.joshondesign.aminogen.custom;

import java.util.Arrays;

/**
 * Created with IntelliJ IDEA.
 * User: josh
 * Date: 3/10/13
 * Time: 12:24 PM
 * To change this template use File | Settings | File Templates.
 */
public class VUtils {
    public static float[] make_z_rot_matrix(float angle)
    {
        float[] m = new float[16];
        double c = Math.cos(angle * Math.PI / 180.0);
        double s = Math.sin(angle * Math.PI / 180.0);
        int i;
        for (i = 0; i < 16; i++) {
            m[i] = 0.0f;
        }
        m[0] = m[5] = m[10] = m[15] = 1.0f;

        m[0] = (float) c;
        m[1] = (float) s;
        m[4] = (float) -s;
        m[5] = (float) c;
        return m;
    }
    public static float[] make_scale_matrix(float xs, float ys, float zs) {
        float[] m = new float[16];
        for (int i = 0; i < 16; i++)
            m[i] = 0.0f;
        m[0] = xs;
        m[5] = ys;
        m[10] = zs;
        m[15] = 1.0f;
        return m;
    }

    private static float A(int row, int col, float[] m) {
        return m[(col<<2)+row];
    }
    private static float B(int row, int col, float[] m) {
        return m[(col<<2)+row];
    }
    private static void P(int row, int col, float[] m, float value) {
        m[(col<<2)+row] = value;
    }
    public static float[] mul_matrix(float[] a, float[] b) {
        float[] p = new float[16];
        for(int i=0; i<4; i++) {
            float ai0 = A(i,0,a);
            float ai1 = A(i,1,a);
            float ai2 = A(i,2,a);
            float ai3 = A(i,3,a);

            for(int j=0; j<4; j++) {
                P(i,j,p, ai0 * B(0,j,b) + ai1*B(1,j,b) + ai2 * B(2,j,b) + ai3 * B(3,j,b));
            }
        }
        return p;
    }

    public static float[] identityMatrix() {
        float[] transArray = new float[16];
        for (int i = 0; i < 16; i++)  transArray[i] = 0.0f;
        transArray[0] = 1;
        transArray[5] = 1;
        transArray[10] = 1;
        transArray[15] = 1;
        return transArray;
    }

    public static float[] make_trans_matrix(float x, float y) {
        float[] transArray = identityMatrix();
        transArray[12] = x;
        transArray[13] = y;

        return transArray;
    }

    public static float[] copy(float[] transform) {
        return Arrays.copyOf(transform,transform.length);
    }
}
