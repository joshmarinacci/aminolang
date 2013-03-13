import com.joshondesign.aminogen.generated.out.Core;
import com.joshondesign.aminogen.generated.out.Node;
import com.joshondesign.aminogen.generated.out.Events;
import com.joshondesign.aminogen.custom.CoreImpl;
import com.joshondesign.aminogen.custom.CoreImpl.*;

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
    
    private static void start(Core core) {
        
        Stage stage = (Stage)core.createStage();
        
        Group root = new Group();
        stage.setRoot(root);
        
        
        
        final Rect rec1 = new Rect();
        rec1.setTx(0);
        rec1.setW(10);
        rec1.setH(10);
        root.add(rec1);
        
        final Rect rec2 = new Rect();
        rec2.setTx(20);
        rec2.setTy(20);
        rec2.setX(0);
        rec2.setY(0);
        rec2.setW(10);
        rec2.setH(10);
        root.add(rec2);
        
        /*
        stage.on(Events.Press, rect, new ICallback() {
            public void call(Object o) {
                p("pressed");
                rect.setFill(CoreImpl.GREEN);
            }
        });
        */
        
        
       
        Circle circle = new Circle();
        circle.setCx(40);
        circle.setCy(20);
        circle.setRadius(20);
        root.add(circle);
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
        
        
        
        PushButton button = new PushButton();
        button.setText("button");
        button.setX(0);
        button.setY(0);
        root.add(button);
        stage.on(Events.Action.toString(), button, new ICallback() {
            public void call(Object o) {
                p("the button happened");
            }
        });
        
        
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

