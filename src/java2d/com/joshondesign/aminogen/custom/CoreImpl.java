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
import java.awt.Graphics;
import java.awt.Graphics2D;
import javax.swing.SwingUtilities;
import javax.swing.Timer;
import java.lang.Runnable;
import javax.swing.*;
import java.awt.RenderingHints;

import java.awt.image.BufferedImage;

public class CoreImpl extends Core {
    public static boolean HEADLESS = false;
    private static boolean pressed = false;
    
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
    
    
    
    public static void p(String s) {
        System.out.println(s);
    }
    
    
    

    
    public static interface ICallback extends 
        com.joshondesign.aminogen.generated.out.Callback {
    }
    public static class Bounds extends 
        com.joshondesign.aminogen.generated.out.Bounds {
        public Bounds(double x, double y, double w, double h) {
            super(x,y,w,h);
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

    JFrame _frame;
    public Java2DRootPanel _rootpanel;
    public EventManager _em;
    Node _nodeparent;
    public Stage() {
        _rootpanel = new Java2DRootPanel(this);
        _em = new EventManager(this,_rootpanel);
        _em.em = _em;
        
        if(!CoreImpl.HEADLESS) {
            _frame = new JFrame();
            _frame.add(_rootpanel); 
            _frame.pack();
            _frame.setSize(400,500);
            _frame.show();
        }
        _nodeparent = new Node() {
            public void markDirty() {
                _rootpanel.repaint();
            }
        };
    }
    
    public Object getNative() {
        return _frame;
    }
    
    @Override
    public void setRoot(Node node) {
        super.setRoot(node);
        node.setParent(_nodeparent);
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
    private Java2DRootPanel panel;
    private List<XEvent> queue = new ArrayList<XEvent>();
    Map<Object,List<Pair<Object,Callback>>> _listeners;
    
    public static EventManager get() {
        return em;
    }
    
    public EventManager(Stage stage, Java2DRootPanel panel) {
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


public static class Java2DRootPanel extends JComponent {
    private Stage stage;
    public Java2DRootPanel(Stage stage) {
        this.stage = stage;
        
        
        this.addMouseListener(new MouseListener() {
                public void mousePressed(MouseEvent e) {
                    processMouseEvent(Events.Press,e);
                }
                public void mouseReleased(MouseEvent e) {
                    processMouseEvent(Events.Release,e);
                }
                public void mouseClicked(MouseEvent e) {
                }
                public void mouseEntered(MouseEvent e) {
                }
                public void mouseExited(MouseEvent e) {
                }
        });
        this.addMouseMotionListener(new MouseMotionListener() {
                public void mouseDragged(MouseEvent e) {
                    processMouseEvent(Events.Drag,e);
                }
                public void mouseMoved(MouseEvent e) {
                }
        });
        this.addKeyListener(new KeyListener() {
            public void keyPressed(KeyEvent e) {
                processKeyEvent(Events.KeyPress,e);
            }
            public void keyReleased(KeyEvent ke) {
            }
            public void keyTyped(KeyEvent ke) {
            }
        });
        this.setFocusable(true);
        this.requestFocus();
        
        this.timer = new Timer(100,new ActionListener() {
            public void actionPerformed(ActionEvent evt) {
                repaint();
            }
        });
        this.timer.start();
    }
    
    private Timer timer;
    
    private void processMouseEvent(Object type, MouseEvent e) {
        Point pt = new Point(e.getX(),e.getY());
        stage._em.processPointerEvent(type,pt);
    }
    
    private void processKeyEvent(Object type, KeyEvent e) {
        if(stage._em.keyboardFocus == null) return;
        Event event = new Event();
        event.setTarget(stage._em.keyboardFocus);
        event.keycode = e.getKeyCode();
        event.keychar = e.getKeyChar();
        if(stage._em._listeners.containsKey(type)) {
            List<Pair<Object,Callback>> list = stage._em._listeners.get(type);
            for(Pair<Object,Callback> pair : list) {
                if(pair.a == event.getTarget()) {
                    pair.b.call(event);
                }
            }
        }
    }
    
    public void paintComponent(Graphics gfx1) {
        this.stage._em.processEvents();
        this.stage.processAnims();
        GFX gfx = new Graphics2DGFX((Graphics2D)gfx1);
        Node root = stage.getRoot();
        if(root instanceof Control) {
            Control con = (Control)root;
            if(con.getW() != getWidth()) {
                con.setW(getWidth());
            }
            if(con.getH() != getHeight()) {
                con.setH(getHeight());
            }
        }
        
        draw(gfx, stage.getRoot());
    }
    
    private void draw(GFX gfx, Node root) {
        if(!root.getVisible()) return;
        gfx.translate(root.getTx(),root.getTy());
        root.draw(gfx);
        gfx.translate(-root.getTx(),-root.getTy());
        if(root instanceof Group) {
            Group group = (Group)root;
            gfx.translate( group.getTx(), group.getTy());
            for(int i=0; i<group.children.size(); i++) {
                Node child = (Node)group.children.get(i);
                draw(gfx,child);
            }
            gfx.translate(-group.getTx(),-group.getTy());
        }
        if(root instanceof Transform) {
            Transform trans = (Transform)root;
            gfx.translate(  trans.getTx(),  trans.getTy());
            gfx.scale( trans.getScalex(), trans.getScaley());
            gfx.rotate( trans.getRotate());
            draw(gfx,trans.getChild());
            gfx.rotate(-trans.getRotate());
            gfx.scale( 1.0/trans.getScalex(), 1.0/trans.getScaley());
            gfx.translate( -trans.getTx(), -trans.getTy());
        }
        if(root instanceof AnchorPanel) {
            AnchorPanel group = (AnchorPanel)root;
            gfx.translate( group.getTx(), group.getTy());
            for(int i=0; i<group.children.size(); i++) {
                Node child = (Node)group.children.get(i);
                draw(gfx,child);
            }
            gfx.translate(-group.getTx(),-group.getTy());
        }
    }

    
    private static void p(String s) {
        System.out.println(s);
    }
}

public static class Graphics2DGFX extends GFX {
    public Graphics2D g;
    public Graphics2DGFX(Graphics2D g) {
        this.g = g;
        this.g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        this.g.setRenderingHint(RenderingHints.KEY_FRACTIONALMETRICS, RenderingHints.VALUE_FRACTIONALMETRICS_ON);
        this.g.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
        this.g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
    }
    @Override
    public void translate(double x, double y) {
        this.g.translate(x,y);
    }
    @Override
    public void scale(double x, double y) {
        this.g.scale(x,y);
    }
    @Override
    public void rotate(double th) {
        this.g.rotate(th);
    }
}


public static class Transform extends
        com.joshondesign.aminogen.generated.out.Transform {
    public Transform(Node node) {
        this.child = node;
        this.child.setParent(this);
    }
}

public static class Group extends
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

public static class Rect extends
        com.joshondesign.aminogen.generated.out.Rect {
    public Rect() {
        setFill(CoreImpl.BLUE);
    }
    public void draw(GFX gfx) {
        Graphics2D g = ((Graphics2DGFX)gfx).g;
        java.awt.Color col = java.awt.Color.BLACK;
        if(getFill() == CoreImpl.RED) {
            col = java.awt.Color.RED;
        }
        if(getFill() == CoreImpl.GREEN) {
            col = java.awt.Color.GREEN;
        }
        if(getFill() == CoreImpl.BLUE) {
            col = java.awt.Color.BLUE;
        }
        g.setPaint(col);
        g.fillRect((int)getX(),(int)getY(),(int)getW(),(int)getH());
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
        Graphics2D g = ((Graphics2DGFX)gfx).g;
        g.setPaint(java.awt.Color.LIGHT_GRAY);
        g.fillRect((int)getX(),(int)getY(),(int)getW(),(int)getH());
        
        double v = this.valueToPoint(this.getValue());
        g.setPaint(java.awt.Color.BLACK);
        g.fillRect((int)getX(),(int)getY(),(int)v,(int)getH());
    }
    @Override
    public void setValue(double v) {
        if(v > this.getMaxvalue()) v = this.getMaxvalue();
        if(v < this.getMinvalue()) v = this.getMinvalue();
        super.setValue(v);
        this.markDirty();
    }
    
    public double valueToPoint(double v) {
        return (this.getValue()-this.getMinvalue()) * (this.getW() / (this.getMaxvalue()-this.getMinvalue()));
    }
    public double pointToValue(double p) {
        return p * (this.getMaxvalue()-this.getMinvalue())/this.getW() + this.getMinvalue();
    }
    
}


public static class ImageView extends 
        com.joshondesign.aminogen.generated.out.ImageView {
    private boolean loaded = false;
    protected BufferedImage img;
    
    @Override
    public void setUrl(String url) {
        this.url = url;
        
        this.loaded = false;
        try {
            this.img = ImageIO.read(new URL(this.getUrl()));
            this.loaded = true;
        } catch (IOException ex) {
            ex.printStackTrace();
        }
        this.markDirty();
    }
    
    @Override
    public void draw(GFX gfx) {
        Graphics2D g = ((Graphics2DGFX)gfx).g;
        g.setPaint(java.awt.Color.RED);
        g.fillRect((int)getX(),(int)getY(),(int)getW(),(int)getH());
        
        if(this.loaded) {
            double s1 = this.getW()/this.img.getWidth();
            double s2 = this.getH()/this.img.getHeight();
            double scale = Math.min(s1,s2);
            if(this.getAutoscale()) {
                scale = Math.max(s1,s2);
            }
            g.drawImage(this.img,
                (int)this.getX(),(int)this.getY(), 
                (int)(scale*this.img.getWidth()),(int)(scale*this.img.getHeight()),
                0,0,this.img.getWidth(),this.img.getHeight(),
                null
                );
        }
        g.setPaint(java.awt.Color.BLACK);
        g.drawRect((int)getX(),(int)getY(),(int)getW(),(int)getH());
    }

}


public static class IBuffer extends Buffer {
    public BufferedImage buffer;
    
    public IBuffer(int w, int h) {
        this.w = w;
        this.h = h;
        this.buffer = new BufferedImage(w,h,BufferedImage.TYPE_INT_ARGB);
    }
    
    public Graphics2D getContext() {
        return this.buffer.createGraphics();
    }
    
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
        Graphics2D g = ((Graphics2DGFX)gfx).g;
        g.setPaint(java.awt.Color.BLACK);
        g.drawString(getText(),(int)getX()+5,(int)getY()+15);
    }
}



public static class Textbox extends
        com.joshondesign.aminogen.generated.out.Textbox {
    public Textbox() {
        /*
        EventManager.get().on(EventsI.KeyPressI, this, new ICallback() {
            public void call(Object o) {
                Event e = (Event)o;
                p("got a keypress " + e.keychar + " " + e.keycode);
                String t = gettext();
                if(e.keycode == 8) {
                    if(t.length() > 0) {
                        t = t.substring(0,t.length()-1);
                        settext(t);
                        return;
                    }
                }
                if(t==null) {
                    t = "";
                }
                String ch = ""+((char)e.keychar);
                settext(t+ch);
            }
        });
        */
    }
    @Override
    public void draw(GFX gfx) {
        Graphics2D g = ((Graphics2DGFX)gfx).g;
        g.setPaint(java.awt.Color.GRAY);
        g.fillRect((int)getX(),(int)getY(),(int)getW(),(int)getH());
        
        //text
        g.setPaint(java.awt.Color.BLACK);
        g.drawString(getText(),(int)getX()+5,(int)getY()+15);
        
        //cursor
        
        
        //border
        g.drawRect((int)getX(),(int)getY(),(int)getW(),(int)getH());
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
    public void draw(GFX gfx) {
        Graphics2D g = ((Graphics2DGFX)gfx).g;
        g.setPaint(java.awt.Color.LIGHT_GRAY);
        if(getPressed()) {
            g.setPaint(java.awt.Color.BLUE);
        }
        g.fillRect((int)getX(),(int)getY(),(int)getW(),(int)getH());
        g.setPaint(java.awt.Color.BLACK);
        g.drawString(getText(),(int)getX()+5,(int)getY()+15);
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
        Graphics2D g = ((Graphics2DGFX)gfx).g;
        g.setPaint(java.awt.Color.LIGHT_GRAY);
        if(getSelected()) {
            g.setPaint(java.awt.Color.BLUE);
        }
        g.fillRect((int)getX(),(int)getY(),(int)getW(),(int)getH());
        g.setPaint(java.awt.Color.BLACK);
        g.drawString(getText(),(int)getX()+5,(int)getY()+15);
    }
}

public static class Circle extends
    com.joshondesign.aminogen.generated.out.Circle {
    public Circle() {
        setFill(CoreImpl.GREEN);
    }
    @Override
    public void draw(GFX gfx) {
        Graphics2D g = ((Graphics2DGFX)gfx).g;
        g.setPaint(java.awt.Color.RED);
        g.fillOval((int)(getCx()-getRadius()),(int)(getCy()-getRadius()),(int)getRadius()*2,(int)getRadius()*2);
    }
}



public static class AnchorPanel extends
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
    public void setW(double w) {
        super.setW(w);
        markLayoutDirty();
    }
    @Override
    public void setH(double h) {
        super.setH(h);
        markLayoutDirty();
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
        
        Graphics2D g = ((Graphics2DGFX)gfx).g;
        g.setPaint(java.awt.Color.GRAY);
        g.fillRect((int)getX(),(int)getY(),(int)getW(),(int)getH());
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

