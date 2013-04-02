import com.joshondesign.aminogen.generated.out.Core;
import com.joshondesign.aminogen.generated.out.Node;
import com.joshondesign.aminogen.generated.out.Events;
import com.joshondesign.aminogen.generated.out.XEvent;
import com.joshondesign.aminogen.generated.out.*;
import com.joshondesign.aminogen.custom.CoreImpl;
import com.joshondesign.aminogen.custom.CoreImpl.ICallback;

import java.util.List;
import java.util.ArrayList;

import java.awt.Graphics2D;

public class General extends Core {
    private static void p(String s) { System.out.println(s); }
    
    public static void main(String ... args) {
        System.out.println("runing the components test");
        new CoreImpl().start(new ICallback() {
            public void call(Object obj) {
                Core core = (Core)obj;
                start(core);
            }
        });
    }

    static Core core;
    static Stage stage;    
    static ICallback shapes = new ICallback() {
        public void call(Object obj) {
             p("doing the shapes\n");
            Group group = (Group)obj;
            final Rect rect = core.createRect();
            rect.setX(100).setY(100).setW(50).setH(25).setFill(CoreImpl.GREEN);
            group.add(rect);
            stage.on(Events.Press, rect, new ICallback() { public void call(Object o) {
                if(rect.getFill() == CoreImpl.BLUE) {
                    rect.setFill(CoreImpl.RED);
                } else {
                    rect.setFill(CoreImpl.BLUE); 
                }
            }}); 
            
            Circle circle = core.createCircle();
            circle.setCx(50).setCy(100).setRadius(30).setFill(CoreImpl.GREEN);
            group.add(circle);

        
            
            //e.target is a generic reference to the drag target.
            //e.deltaX is how much the x moved between events, regardless of the current
            //coordinate space's movement (ie: setting the x and y)
            //drag works even if you drag quickly and go outside the target, thus it
            //preserves the drag target through the entire gesture
            stage.on(Events.Drag, circle, new ICallback(){ public void call(Object o) {
                XEvent e = (XEvent)o;
                
                ((Circle)e.target).setCx(((Circle)e.target).getCx() + e.delta.getX());
                ((Circle)e.target).setCy(((Circle)e.target).getCy() + e.delta.getY());
            }});
        }
    };
    static ICallback comps = new ICallback() { public void call(Object obj) {
        Group c = (Group)obj;
        PushButton button = core.createPushButton();
        button.setText("button");
        button.setX(200);
        button.setY(50);
        c.add(button);
        
    
        ToggleButton tbutton = core.createToggleButton();
        tbutton.setText("toggle");
        tbutton.setX(200);
        tbutton.setY(100);
        c.add(tbutton);
        
        Label label = core.createLabel();
        label.setText("label");
        label.setX(200);
        label.setY(130);
        c.add(label);
        
        Slider slider = core.createSlider();
        slider.setX(200);
        slider.setY(160);
        slider.setW(100);
        slider.setH(20);
        c.add(slider);
        
        
        Textbox textbox = core.createTextbox();
        textbox.setX(200);
        textbox.setY(190);
        textbox.setW(100);
        textbox.setH(20);
        textbox.setText("foo");
        /*
        root.on(Events.KeyPress, textbox, function(e) {
            var t = textbox.getText();
            if(!t) t = "";
            
            if(e.e.keyCode == 45 || e.e.keyCode == 8) {
                if(t.length > 0) {
                    t = t.substring(0,t.length-1);
                    textbox.setText(t);
                    return;
                }
            }
            var ch = String.fromCharCode(e.e.keyCode);
            if(e.e.shiftKey) {
                ch = ch.toUpperCase();
            } else {
                ch = ch.toLowerCase();
            }
            textbox.settext(t+ch);
        });
        */
        c.add(textbox);
    }};
    
    static ICallback events = new ICallback() {  public void call(Object obj) {
        Group c = (Group)obj;
        PushButton b1 = core.createPushButton();
        b1.setText("no trans").setX(10).setY(100);
        c.add(b1);
        
        PushButton b2 = core.createPushButton();
        b2.setText("trans xy").setTx(120).setTy(100);
        c.add(b2);
        
        PushButton b3 = core.createPushButton();
        b3.setText("group trans").setTx(0).setTy(0);
        Group g3 = core.createGroup();
        g3.setTx(230).setTy(100);
        g3.add(b3);
        c.add(g3);
        
        PushButton b4 = core.createPushButton();
        b4.setText("rotate").setTx(0).setTy(0);
        Transform g4 = core.createTransform();
        g4.setRotate(45).setTx(10).setTy(150);
        g4.setChild(b4);
        c.add(g4);
        
        PushButton b5 = core.createPushButton();
        b5.setText("scale").setTx(0).setTy(0);
        Transform g5 = core.createTransform();
        g5.setScalex(2).setScaley(2).setTx(120).setTy(150);
        g5.setChild(b5);
        c.add(g5);
    }};
    
    static int current = 0;
    private static void start(Core core) {
        
        General.core = core;
        Stage stage = core.createStage();
        General.stage = stage;
        
        Group root = core.createGroup();
        stage.setRoot(root);
        
        final List<ICallback> tests = new ArrayList<ICallback>();
        tests.add(shapes);
        tests.add(comps);
        tests.add(events);
//        tests.add(anims);
        
        current = -1;
        final Group testgroup = core.createGroup();
        root.add(testgroup);
        PushButton prevButton = core.createPushButton();
        prevButton.setText("prev").setX(10).setY(10).setW(80).setH(20);
        root.add(prevButton);
        stage.on(Events.Press, prevButton, new ICallback() {
            public void call(Object obj) {
                testgroup.clear();
                current = current -1;
                if(current < 0) {
                    current = tests.size()-1;
                }
                tests.get(current).call(testgroup);
            }
        });
        
        PushButton nextButton = core.createPushButton();
        nextButton.setText("next").setX(100).setY(10).setW(80).setH(20);
        root.add(nextButton);
        stage.on(Events.Press,nextButton,new ICallback() {
            public void call(Object o) {
                testgroup.clear();
                current = current + 1;
                if(current >= tests.size()) {
                    current = 0;
                }
                tests.get(current).call(testgroup);
            }
        });
        
        
        /*
        final Rect rec1 = core.createRect();
        rec1.setTx(0);
        rec1.setW(10);
        rec1.setH(10);
        g.add(rec1);
        
        final Rect rec2 = core.createRect();
        rec2.setTx(20);
        rec2.setTy(20);
        rec2.setX(0);
        rec2.setY(0);
        rec2.setW(10);
        rec2.setH(10);
        g.add(rec2);
        */
        /*
        stage.on(Events.Press, rect, new ICallback() {
            public void call(Object o) {
                p("pressed");
                rect.setFill(CoreImpl.GREEN);
            }
        });
        */
        
        
       /*
        Circle circle = core.createCircle();
        circle.setCx(40);
        circle.setCy(20);
        circle.setRadius(20);
        g.add(circle);
        */
        /*
        stage.on(Events.Drag, circle, new ICallback() {
            public void call(Object o) {
                Event e = (Event)o;
                Node t = (Node)e.getTarget();
                t.setTx(t.getTx()+e.getDelta().getX());
                t.setTy(t.getTy()+e.getDelta().getY());
            }
        });
        */
        
        
        /*
        PushButton button = core.createPushButton();
        button.setText("button").setTx(0).setTy(60);
        g.add(button);
        stage.on(Events.Action.toString(), button, new ICallback() {
            public void call(Object o) {
                p("the button happened");
            }
        });
        */
        
        /*
        ToggleButton tbutton = new ToggleButton();
        tbutton.setText("toggle");
        tbutton.setX(200);
        tbutton.setY(100);
        root.add(tbutton);
        
        
        Label label = new Label();
        label.setText("label");
        label.setX(200);
        label.setY(130);
        root.add(label);
        
        Slider slider = new Slider();
        slider.setX(200);
        slider.setY(160);
        slider.setW(100);
        slider.setH(20);        
        root.add(slider);
        
        final Textbox textbox = new Textbox();
        
        textbox.setX(200);
        textbox.setY(190);
        textbox.setW(100);
        textbox.setH(20);
        textbox.setText("foo");
        
        root.add(textbox);
        */
        
        /*
        {
            
            AnchorPanel ap = new AnchorPanel();
            ap.setTx(0);
            ap.setTy(200);
            ap.setW(200);
            ap.setH(150);
            
            ToggleButton btn = new ToggleButton();
            btn.setText("toggle");
            btn.setX(0);
            btn.setY(0);
            btn.setRightanchored(true);
            ap.add(btn);
            
            root.add(ap);
        }
        */
    }
}

