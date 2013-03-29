package com.joshondesign.aminogen.custom;

import com.joshondesign.aminogen.generated.out.*;
import com.joshondesign.aminogen.custom.CoreImpl.Event;
import com.joshondesign.aminogen.custom.CoreImpl.EventManager;
import com.joshondesign.aminogen.custom.CoreImpl.Graphics2DGFX;
import com.joshondesign.aminogen.custom.CoreImpl.ICallback;

import java.awt.Graphics2D;
import java.util.Map;
import java.util.List;
import java.util.ArrayList;
import java.util.HashMap;

public class Controls {
    
public static class J2DSlider extends
        com.joshondesign.aminogen.generated.out.Slider {
            
    public J2DSlider() {        
        EventManager.get().on(Events.Drag,this,new Callback() {
            public void call(Object o) {
                Event e = (Event)o;
                J2DSlider r = (J2DSlider)e.getTarget();
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


public static class J2DLabel extends
        com.joshondesign.aminogen.generated.out.Label {
    @Override
    public void draw(GFX gfx) {
        Graphics2D g = ((Graphics2DGFX)gfx).g;
        g.setPaint(java.awt.Color.BLACK);
        g.drawString(getText(),(int)getX()+5,(int)getY()+15);
    }
}



public static class J2DTextbox extends
        com.joshondesign.aminogen.generated.out.Textbox {
    public J2DTextbox() {
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



public static class J2DPushButton extends
        com.joshondesign.aminogen.generated.out.PushButton {
    public J2DPushButton() {
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

public static class J2DToggleButton extends
    com.joshondesign.aminogen.generated.out.ToggleButton {
    public J2DToggleButton() {
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


}
