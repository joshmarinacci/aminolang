package com.joshondesign.aminogen.custom;

import com.joshondesign.aminogen.generated.out.*;

import java.util.*;

import java.lang.reflect.Method;

import java.net.URL;
import javax.imageio.ImageIO;
import java.io.IOException;

import java.awt.event.ActionListener;
import java.awt.event.ActionEvent;
import java.awt.event.KeyListener;
import java.awt.event.MouseListener;
import java.awt.event.MouseMotionListener;
import java.awt.event.MouseEvent;
import java.awt.event.KeyEvent;

import javax.swing.Timer;
import java.awt.Frame;
import javax.swing.SwingUtilities;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;


import javax.media.opengl.GL2ES2;
import javax.media.opengl.GLCapabilities;
import javax.media.opengl.GLProfile;
import javax.media.opengl.*;
import javax.media.opengl.awt.GLCanvas;
import com.jogamp.opengl.util.FPSAnimator;
import java.awt.event.WindowAdapter;
import java.awt.event.WindowEvent;
import static javax.media.opengl.GL.GL_COLOR_BUFFER_BIT;
import static javax.media.opengl.GL.GL_DEPTH_BUFFER_BIT;
import java.nio.FloatBuffer;
import com.jogamp.common.nio.Buffers;

public class CoreImpl extends Core {
    public static boolean HEADLESS = false;
    public void start(final Callback fn) {
        SwingUtilities.invokeLater(new Runnable() {
            public void run() {
                fn.call(CoreImpl.this);
            }
        });
    }
    
    public Stage createStage() {
        return new Stage();
    }

    @Override
    public Rect createRect() {
        return new JoglRect();
    }
    
    @Override
    public Circle createCircle() {
        return new JoglCircle();
    }
    
    @Override
    public Group createGroup() {
        return new JoglGroup();
    }
    

    public static interface ICallback extends 
        com.joshondesign.aminogen.generated.out.Callback {
    }
    public static class Bounds extends 
        com.joshondesign.aminogen.generated.out.Bounds {
        public Bounds(double x, double y, double w, double h) {
            super(x,y,w,h);
        }
        public float getX2() {
            return (float)getX() + (float)getW();
        }
        public float getY2() {
            return (float)getY() + (float)getH();
        }
        
    }
    public static class Color extends 
        com.joshondesign.aminogen.generated.out.Color {
    }
    public static final Color RED = new Color();
    public static final Color GREEN = new Color();
    public static final Color BLUE = new Color();
    
static class Pair<A,B> {
    A a;
    B b;
    public Pair(A a, B b) {
        this.a = a;
        this.b = b;
    }
}
public static class Event extends XEvent {
//    Node target;
public    int x;
public    int y;
public    int deltaX;
public    int deltaY;
public    int keycode;
public    int keychar;
}

public static class Stage extends 
        com.joshondesign.aminogen.generated.out.Stage {

    Frame _frame;
    public JoglRootPanel _rootpanel;
    public EventManager _em;
    Node _nodeparent;
    
    public Stage() {
        
        GLProfile glp = GLProfile.get(GLProfile.GL2ES2);
        GLProfile.initSingleton();

        GLCapabilities caps = new GLCapabilities(glp);
        _rootpanel = new JoglRootPanel(this, caps);
        _em = new EventManager(this,_rootpanel);
        _em.em = _em;
        
        if(!CoreImpl.HEADLESS) {
            _frame = new Frame();
            _frame.add(_rootpanel); 
            _frame.pack();
            _frame.setSize(400,500);
            _frame.show();
            
            _rootpanel.addGLEventListener(new AminoGLEventListener(this));
            FPSAnimator animator = new FPSAnimator(_rootpanel,60);
            animator.start();
            _frame.addWindowListener(new WindowAdapter() {
                @Override
                public void windowClosing(WindowEvent windowEvent) {
                    System.exit(0);
                }
            });
        }
        _nodeparent = new Node() {
            public void markDirty() {
                //_rootpanel.repaint();
            }
        };
    }
    
    private ColorShader colorShader;
    private TextureShader textureShader;
    private FontShader fontShader;
    
    protected void doInit(GL2ES2 gl) {
        gl.glClearColor(0.4f,0.5f,0.5f,0.0f);
        colorShader = new ColorShader(gl);
        textureShader = new TextureShader(gl);
        fontShader = new FontShader(gl);
        /*
        nodes = new ArrayList<Node>();
        nodes.add(new Rect(0,0, 5f,5f).setTx(-5));
        nodes.add(new Rect(0,0, 10f,10f).setTx(8));
        nodes.add(new Button().setTx(-10).setTy(-8));
        */
    }

    protected void doDraw(GL2ES2 gl) {
        //clear the screen
        gl.glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

        Node root = getRoot();

        JOGLGFX gfx = new JOGLGFX(gl,this);
        draw(gfx,root);
    }
    
    private void draw(JOGLGFX gfx, Node root) {
        if(!root.getVisible()) return;
        //System.out.println("" + root.getClass().getName());
        gfx.save();
        gfx.translate(root.getTx(), root.getTy());
        //System.out.println("tx = " + root.getTx() + " " + root.getTy());
        root.draw(gfx);
        if(root instanceof Group) {
            Group group = (Group)root;
            for(int i=0; i<group.getChildCount(); i++) {
                Node child = (Node)group.getChild(i);
                draw(gfx,child);
            }
        }
        gfx.restore();
    }        
    
    public Object getNative() {
        return _frame;
    }
    
    @Override
    public Stage setRoot(Node node) {
        super.setRoot(node);
        node.setParent(_nodeparent);
        return this;
    }
    
    @Override
    public void on(Object type, Object target, Callback cb) {
        _em.on(type,target,cb);
    }
    @Override
    public void addAnim(com.joshondesign.aminogen.generated.out.PropAnim anim){
        this.anims.add(anim);
    }
    
    private List<com.joshondesign.aminogen.generated.out.PropAnim> anims = new ArrayList<com.joshondesign.aminogen.generated.out.PropAnim>();
    
    
    public void markDirty() {
    }
    void processAnims() {
        for(com.joshondesign.aminogen.generated.out.PropAnim anim : this.anims) {
            ((PropAnim)anim).update();
        }
    }
}

public static class EventManager extends
    com.joshondesign.aminogen.generated.out.EventManager {
    private Stage stage;
    
    public static EventManager em;
    private JoglRootPanel panel;
    private List<XEvent> queue = new ArrayList<XEvent>();
    Map<Object,List<Pair<Object,Callback>>> _listeners;
    
    public static EventManager get() {
        return em;
    }
    
    public EventManager(Stage stage, JoglRootPanel panel) {
        this.stage = stage;
        this.panel = panel;
        _listeners = new HashMap<Object,List<Pair<Object,Callback>>>();
    }
    
    @Override
    public XEvent createEvent() {
        return new Event();
    }
    
    @Override
    public void on(Object type, Object target, Callback cb) {        
        if(!_listeners.containsKey(type)) {
            _listeners.put(type,new ArrayList<Pair<Object,Callback>>());
        }
        _listeners.get(type).add(new Pair<Object,Callback>(target,cb));
    }
    @Override    
    public void later(final Callback cb) {
        SwingUtilities.invokeLater(new Runnable() {
            public void run() {
                cb.call(null);
            }
        });
    }
    
    @Override    
    public void repeat(int interval, final Callback cb) {
        Timer timer = new Timer(interval,new ActionListener() {
            public void actionPerformed(ActionEvent evt) {
                cb.call(null);
            }
        });
        timer.start();
    }
    
    public void fire(XEvent event) {
        this.queue.add(event);
        panel.repaint();
    }
    public void tfire(XEvent event) {
        this.queue.add(event);
        panel.repaint();
    }
        
    public void fire(Object type, Object target) {
        final XEvent ev = createEvent();
        ev.setType(type);
        ev.setTarget(target);
        later(new Callback() { public void call(Object o) { 
            EventManager.this.tfire(ev);
        }});
    }
    
    public void processEvents() {
        for(XEvent event : this.queue) {
            if(_listeners.containsKey(event.getType())) {
                List<Pair<Object,Callback>> list = _listeners.get(event.getType());
                List<Pair<Object,Callback>> l2 = new ArrayList<Pair<Object,Callback>>();
                l2.addAll(list);
                for(Pair<Object,Callback> pair : l2) {
                    if(pair.a == event.getTarget()) {
                        pair.b.call(event);
                    }
                }
            }
        }
        this.queue.clear();
    }
    
    @Override
    public Node findNode(Point point) {
        return findNode(stage.getRoot(),point.getX(),point.getY());
    }
    
    private Node findNode(Node root, double x, double y) {
        if(root == null) return null;
        if(!root.getVisible()) return null;
        Point pt = new Point(x-root.getTx(),y-root.getTy());
        
        
        if(root instanceof Parent) {
            Parent group = (Parent)root;
            for(int i=0; i<group.getChildCount(); i++) {
                Node child = (Node)group.getChild(i);
                Point inner = group.toInnerCoords(pt);
                Node ret = findNode(child,
                    x-group.getTx(),
                    y-group.getTy()
                    );
                if(ret != null) return ret;
            }
        }
        
        /*
        if(root instanceof AnchorPanel) {
            AnchorPanel group = (AnchorPanel)root;
            for(int i=0; i<group.children.size(); i++) {
                Node child = (Node)group.children.get(i);
                Node ret = findNode(child,
                    x-group.getTx(),
                    y-group.getTy()
                    );
                if(ret != null) return ret;
            }
        }
        */
        
        if(root instanceof Transform) {
            Transform trans = (Transform)root;
            Node child = trans.getChild();
            double x2 = x-trans.getTx();
            double y2 = y-trans.getTy();
            double theta = -trans.getRotate();
            double x3 = x2 * Math.cos(theta) - y2 * Math.sin(theta);
            double y3 = x2 * Math.sin(theta) + y2 * Math.cos(theta);
            double x4 = x3/trans.getScalex();
            double y4 = y3/trans.getScaley();
            Node ret = findNode(child, x4, y4);
            if(ret != null) return ret;
        }
        
        if(root.contains(pt)) {
            return root;
        }
        
        return null;
    }
    
    public void fireEvent(com.joshondesign.aminogen.generated.out.XEvent event) {
        this.queue.add(event);
        panel.repaint();
    }
    
}



    public static class JoglRootPanel extends GLCanvas{
        private Stage stage;
        public JoglRootPanel(Stage stage, GLCapabilities caps) {
            super(caps);
            this.stage = stage;
        }
    }


    public static class JOGLGFX extends GFX {
        private final GL2ES2 gl;
        private final Stage test2;
        private final Deque<float[]> stack;
        private float[] transform;

        public JOGLGFX(GL2ES2 gl, Stage test2) {
            this.gl = gl;
            this.test2 = test2;
            this.stack = new ArrayDeque<float[]>();
            transform = VUtils.identityMatrix();
        }

        public void save() {
            stack.push(transform);
            transform = VUtils.copy(transform);
        }
        public void restore() {
            transform = stack.pop();
        }

        public void translate(float x, float y) {
            //System.out.println("translating by : " + x + " " + y);
            float[] tr = VUtils.make_trans_matrix(x, y);
            transform = VUtils.mul_matrix(transform,tr);
        }
        @Override
        public void translate(double x, double y) {
            //System.out.println("translating by : " + x + " " + y);
            float[] tr = VUtils.make_trans_matrix((float)x, (float)y);
            transform = VUtils.mul_matrix(transform,tr);
        }

        public void fillQuadColor(Color color, Bounds bounds) {
            float x = (float)bounds.getX();
            float y = (float)bounds.getY();
            float x2 = bounds.getX2();
            float y2 = bounds.getY2();
            FloatBuffer verts = Buffers.newDirectFloatBuffer(new float[]{
                    x, y,
                    x2, y,
                    x2, y2,
                    x2, y2,
                    x, y2,
                    x, y
            });
            FloatBuffer colors = Buffers.newDirectFloatBuffer(new float[]{
                    1, 0, 0,
                    1, 0, 0,
                    1, 0, 0,
                    1, 0, 0,
                    1, 0, 0,
                    1, 0, 0
            });

            test2.colorShader.apply(gl,transform,verts,colors);
        }
        public void fillQuadTexture(Tex tex, Bounds bounds,  Bounds textureBounds) {
            float x = (float)bounds.getX();
            float y = (float)bounds.getY();
            float x2 = bounds.getX2();
            float y2 = bounds.getY2();
            FloatBuffer verts = Buffers.newDirectFloatBuffer(new float[]{
                    x, y,
                    x2, y,
                    x2, y2,
                    x2, y2,
                    x, y2,
                    x, y
            });

            float iw = test2.textureShader.mainTexture.getImageWidth();
            float ih = test2.textureShader.mainTexture.getImageHeight();

            float tx  = (float)textureBounds.getX()/iw;
            float ty  = (float)textureBounds.getY()/ih;
            float tx2 = textureBounds.getX2()/iw;
            float ty2 = textureBounds.getY2()/ih;

            FloatBuffer texcoords = Buffers.newDirectFloatBuffer(new float[]{
                    tx,  ty,
                    tx2, ty,
                    tx2, ty2,
                    tx2, ty2,
                    tx,  ty2,
                    tx,  ty
            });
            test2.textureShader.apply(gl,transform,verts, texcoords);
        }
        public void fillQuadTexture(Tex tex, Bounds bounds, Bounds textureBounds, Insets insets) {
            //upper left
            float[] xs = new float[]{(float)bounds.getX(), insets.getLeft(), bounds.getX2() - insets.getRight(), bounds.getX2()};
            float[] ys = new float[]{(float)bounds.getY(), insets.getTop(), bounds.getY2() - insets.getBottom(), bounds.getY2()};
            for(int j=0; j<3; j++) {
                for (int i = 0; i < 3; i++) {
                    Bounds b2 = new Bounds(xs[i], ys[j], xs[i + 1]-xs[i], ys[j+1]-ys[j]);
                    fillQuadTexture(tex, b2, textureBounds);
                }
            }
        }
        public void fillQuadText(Color color, String text, double x, double y) {
            test2.fontShader.apply(gl,transform,text);
        }
    }


    private static class AminoGLEventListener implements GLEventListener {
        private Stage stage;
        public AminoGLEventListener(Stage stage) {
            this.stage = stage;
        }

        @Override
        public void init(GLAutoDrawable glAutoDrawable) {
            GL2ES2 gl = glAutoDrawable.getGL().getGL2ES2();
            stage.doInit(gl);
        }

        @Override
        public void dispose(GLAutoDrawable glAutoDrawable) {
        }

        @Override
        public void display(GLAutoDrawable glAutoDrawable) {
            update();
            draw(glAutoDrawable);
        }

        private void update() {
        }


        private void draw(GLAutoDrawable glAutoDrawable) {
            GL2ES2 gl = glAutoDrawable.getGL().getGL2ES2();
            stage.doDraw(gl);
        }


        @Override
        public void reshape(GLAutoDrawable glAutoDrawable, int i, int i2, int i3, int i4) {
        }


    }
    private static Tex SkinTexture = new Tex();

    private static class Tex {

    }


public static class Transform extends
        com.joshondesign.aminogen.generated.out.Transform {
    public Transform(Node node) {
        this.child = node;
        this.child.setParent(this);
    }
}

public static class JoglGroup extends
        com.joshondesign.aminogen.generated.out.Group {
    public List<Node> children = new ArrayList<Node>();
    @Override
    public void add(Node child) {
        this.children.add(child);
        child.setParent(this);
        markDirty();
    }
    public void clear() {
        this.children.clear();
        markDirty();
    }
    
    @Override
    public int getChildCount() {
        return this.children.size();
    }
    @Override
    public Node getChild(int i) {
        return this.children.get(i);
    }
        
}



public static class JoglRect extends
        com.joshondesign.aminogen.generated.out.Rect {
    public JoglRect() {
        setFill(CoreImpl.BLUE);
    }
    public void draw(GFX g) {
        JOGLGFX gfx = (JOGLGFX)g;
        gfx.fillQuadColor(RED, 
            new Bounds(this.x, this.y, this.w, this.h));
    }
    public Bounds getBounds() {
        Bounds b = new Bounds(this.getX(),this.getY(),this.getW(),this.getH());
        return b;
    }
}

public static class Slider extends
        com.joshondesign.aminogen.generated.out.Slider {
            
    public Slider() {        
        EventManager.get().on(Events.Drag,this,new Callback() {
            public void call(Object o) {
                Event e = (Event)o;
                Slider r = (Slider)e.getTarget();
                r.setValue(r.pointToValue(e.getPoint().getX()-r.getX()));
                markDirty();
            }
        });
    }
            
    public void draw(GFX gfx) {
    }
    @Override
    public Slider setValue(double v) {
        if(v > this.getMaxvalue()) v = this.getMaxvalue();
        if(v < this.getMinvalue()) v = this.getMinvalue();
        super.setValue(v);
        this.markDirty();
        return this;
    }
    
    public double valueToPoint(double v) {
        return (this.getValue()-this.getMinvalue()) * (this.getW() / (this.getMaxvalue()-this.getMinvalue()));
    }
    public double pointToValue(double p) {
        return p * (this.getMaxvalue()-this.getMinvalue())/this.getW() + this.getMinvalue();
    }
    
}


public static class JoglImageView extends 
        com.joshondesign.aminogen.generated.out.ImageView {
    private boolean loaded = false;
    protected BufferedImage img;
    
    @Override
    public ImageView setUrl(String url) {
        this.url = url;
        
        this.loaded = false;
        try {
            this.img = ImageIO.read(new URL(this.getUrl()));
            this.loaded = true;
        } catch (IOException ex) {
            ex.printStackTrace();
        }
        this.markDirty();
        return this;
    }
    
    @Override
    public void draw(GFX gfx) {
    }

}


public static class IBuffer extends Buffer {
    public BufferedImage buffer;
    
    public IBuffer(int w, int h) {
        this.w = w;
        this.h = h;
        this.buffer = new BufferedImage(w,h,BufferedImage.TYPE_INT_ARGB);
    }
    /*
    public Graphics2D getContext() {
        return this.buffer.createGraphics();
    }
    */
    
    public int getA(int x, int y) {
        return (this.buffer.getRGB(x,y) >> 24) & 0xFF;
    };
    public int getR(int x, int y) {
        return (this.buffer.getRGB(x,y) >> 16) & 0xFF;
    };
    public int getG(int x, int y) {
        return (this.buffer.getRGB(x,y) >> 8) & 0xFF;
    };
    public int getB(int x, int y) {
        return (this.buffer.getRGB(x,y) >> 0) & 0xFF;
    };
    public void setRGBA(int x, int y, int argb) {
        this.buffer.setRGB(x,y,argb);
    }
}


public static class Label extends
        com.joshondesign.aminogen.generated.out.Label {
    @Override
    public void draw(GFX gfx) {
    }
}



public static class Textbox extends
        com.joshondesign.aminogen.generated.out.Textbox {
    public Textbox() {
    }
    @Override
    public void draw(GFX gfx) {
    }
}



public static class PushButton extends
        com.joshondesign.aminogen.generated.out.PushButton {
    public PushButton() {
        on(Events.Press,new ICallback() {
            public void call(Object o) {
                setPressed(true);
                markDirty();
            }
        });
        on(Events.Release,new ICallback() {
            public void call(Object o) {
                setPressed(false);
                tfire(Events.Action);
                markDirty();
            }
        });
    }
    private void tfire(Object type) { fire(type);  }
    @Override
    public void draw(GFX g) {
        JOGLGFX gfx = (JOGLGFX)g;
//        gfx.fillQuadColor(RED, new Bounds(this.x, this.y, this.w, this.h));
            gfx.fillQuadTexture(SkinTexture,
                    new Bounds(0, 0, 40, 20),
                    new Bounds(4, 7, 71 - 6, 74 - 9),
                    new Insets(3, 3, 3, 3));
            gfx.fillQuadText(RED, getText(), 0,0);
    }
    public Bounds getBounds() {
        Bounds b = new Bounds(this.getX(),this.getY(),this.getW(),this.getH());
        return b;
    }
}

public static class ToggleButton extends
    com.joshondesign.aminogen.generated.out.ToggleButton {
    public ToggleButton() {
        on(Events.Press,new ICallback() {
            public void call(Object o) {
                setSelected(!getSelected());
                markDirty();
            }
        });
        on(Events.Release,new ICallback() {
            public void call(Object o) {
                tfire(Events.Action);
                markDirty();
            }
        });
    }
    private void tfire(Object type) { fire(type);  }
    @Override
    public void draw(GFX gfx) {
    }
}

public static class JoglCircle extends
    com.joshondesign.aminogen.generated.out.Circle {
    public JoglCircle() {
        setFill(CoreImpl.GREEN);
    }
    @Override
    public void draw(GFX g) {
        JOGLGFX gfx = (JOGLGFX)g;
        gfx.fillQuadColor(RED, new Bounds(this.cx, this.cy, this.radius, this.radius));
    }
}



public static class JoglAnchorPanel extends
    com.joshondesign.aminogen.generated.out.AnchorPanel {
        
    public List<Control> children = new ArrayList<Control>();
    private Map<Control,Bounds> confbounds = new HashMap<Control,Bounds>();
    
    @Override
    public void add(Control child) {
        this.children.add(child);
        child.setParent(this);
        markDirty();
    }
    
    @Override
    public AnchorPanel setW(double w) {
        super.setW(w);
        markLayoutDirty();
        return this;
    }
    @Override
    public AnchorPanel setH(double h) {
        super.setH(h);
        markLayoutDirty();
        return this;
    }
    
    private boolean layoutDirty = false;
    private void markLayoutDirty() {
        this.layoutDirty = true;
    }
    
    private double startw;
    private double starth;
    public void start() {
        for(Control child : children) {
            Bounds b = new Bounds(
            child.getTx(),
            child.getTy(),
            child.getW(),
            child.getH()
                );
            confbounds.put(child, b);
        }
        startw = this.getW();
        starth = this.getH();
    }
    
    private void doLayout() {
        for(Node n : children) {
            if(n instanceof Control) {
                Control c = (Control)n;
                if(confbounds.get(c) == null) return;
                if(!c.getLeftanchored() && c.getRightanchored()) {
                    Bounds b = confbounds.get(c);
                    double x = getW()-(startw-b.getX());
                    c.setTx(x);
                }
                if(c.getLeftanchored() && c.getRightanchored()) {
                    Bounds b = confbounds.get(c);
                    double x = b.getX();
                    double ox2 = b.getX()+b.getW();
                    double gap = startw - ox2;
                    double nx2 = getW()-gap;
                    double w = nx2-x;
                    c.setTx(x);
                    c.setW(w);
                }
                
                if(!c.getTopanchored() && c.getBottomanchored()) {
                    Bounds b = confbounds.get(c);
                    double y = getH()-(starth - b.getY());
                    c.setTy(y);
                }
                
                if(c.getTopanchored() && c.getBottomanchored()) {
                    Bounds b = confbounds.get(c);
                    double y = b.getY();
                    double oy2 = b.getY()+b.getH();
                    double gap = starth - oy2;
                    double ny2 = getH()-gap;
                    double h = ny2-y;
                    c.setTy(y);
                    c.setH(h);
                }
            }
        }
        this.layoutDirty = false;
    }
    
    @Override
    public void draw(GFX gfx) {
        if(this.layoutDirty) {
            doLayout();
        }
    }
}


public static class PropAnim extends
    com.joshondesign.aminogen.generated.out.PropAnim {
        private boolean running = false;
        private boolean finished = false;
        private long startTime = 0;
        public void update() {
            if(this.finished) return;
            if(!this.running) {
                this.startTime = new Date().getTime();
                this.running = true;
                return;
            }
            long time = new Date().getTime();
            long dt = time-this.startTime;
            double t = ((double)dt)/((double)this.getDuration());
            if(t > 1) {
                this.finished = true;
                return;
            }
            /*
            if(this.easefn != null) {
                t = this.easefn(t);
            }
            */
            double v = (this.getEndvalue()-this.getStartvalue())*t + this.getStartvalue();
            try {
                Method method = this.getTarget().getClass().getMethod("set"+this.getName(),Double.TYPE);
                method.invoke(this.getTarget(),v);
            } catch (Exception ex) {
                ex.printStackTrace();
            }
        }
}

}

