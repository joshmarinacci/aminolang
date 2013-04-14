#include <math.h>
#include <time.h>
#include <stdio.h>


//these should probably move into the NodeStage class or a GraphicsUtils class
#define ASSERT_EQ(A, B) {if ((A) != (B)) {printf ("ERROR: %d\n", __LINE__); exit(9); }}
#define ASSERT_NE(A, B) {if ((A) == (B)) {printf ("ERROR: %d\n", __LINE__); exit(9); }}
#define EXPECT_TRUE(A) {if ((A) == 0) {printf ("ERROR: %d\n", __LINE__); exit(9); }}

static void
make_z_rot_matrix(GLfloat angle, GLfloat *m)
{
   float c = cos(angle * M_PI / 180.0);
   float s = sin(angle * M_PI / 180.0);
   int i;
   for (i = 0; i < 16; i++)
      m[i] = 0.0;
   m[0] = m[5] = m[10] = m[15] = 1.0;

   m[0] = c;
   m[1] = s;
   m[4] = -s;
   m[5] = c;
}

static void
make_scale_matrix(GLfloat xs, GLfloat ys, GLfloat zs, GLfloat *m)
{
   int i;
   for (i = 0; i < 16; i++)
      m[i] = 0.0;
   m[0] = xs;
   m[5] = ys;
   m[10] = zs;
   m[15] = 1.0;
}


static void
make_identity_matrix(GLfloat *m) {
   int i;
   for (i = 0; i < 16; i++)
      m[i] = 0.0;
    m[0] = 1;
    m[5] = 1;
    m[10] = 1;
    m[15] = 1;
}

static void 
make_trans_matrix(GLfloat x, GLfloat y, GLfloat *m)
{
    make_identity_matrix(m);
    m[12] = x;
    m[13] = y;
}

static void
mul_matrix(GLfloat *prod, const GLfloat *a, const GLfloat *b)
{
#define A(row,col)  a[(col<<2)+row]
#define B(row,col)  b[(col<<2)+row]
#define P(row,col)  p[(col<<2)+row]
   GLfloat p[16];
   GLint i;
   for (i = 0; i < 4; i++) {
      const GLfloat ai0=A(i,0),  ai1=A(i,1),  ai2=A(i,2),  ai3=A(i,3);
      P(i,0) = ai0 * B(0,0) + ai1 * B(1,0) + ai2 * B(2,0) + ai3 * B(3,0);
      P(i,1) = ai0 * B(0,1) + ai1 * B(1,1) + ai2 * B(2,1) + ai3 * B(3,1);
      P(i,2) = ai0 * B(0,2) + ai1 * B(1,2) + ai2 * B(2,2) + ai3 * B(3,2);
      P(i,3) = ai0 * B(0,3) + ai1 * B(1,3) + ai2 * B(2,3) + ai3 * B(3,3);
   }
   memcpy(prod, p, sizeof(p));
#undef A
#undef B
#undef PROD
}

static void 
loadOrthoMatrix(GLfloat *modelView,  GLfloat left, GLfloat right, GLfloat bottom, GLfloat top, GLfloat near, GLfloat far) {
            GLfloat r_l = right - left;
            GLfloat t_b = top - bottom;
            GLfloat f_n = far - near;
            GLfloat tx = - (right + left) / (right - left);
            GLfloat ty = - (top + bottom) / (top - bottom);
            GLfloat tz = - (far + near) / (far - near);
            
            modelView[0] = 2.0f / r_l;
            modelView[1] = 0.0f;
            modelView[2] = 0.0f;
            modelView[3] = tx;
        
            modelView[4] = 0.0f;
            modelView[5] = 2.0f / t_b;
            modelView[6] = 0.0f;
            modelView[7] = ty;
        
            modelView[8] = 0.0f;
            modelView[9] = 0.0f;
            modelView[10] = 2.0f / f_n;
            modelView[11] = tz;
        
            modelView[12] = 0.0f;
            modelView[13] = 0.0f;
            modelView[14] = 0.0f;
            modelView[15] = 1.0f;
    }
    
   



