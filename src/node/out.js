function Callback(){
    this.call = function(obj){
        
    }}
function GFX(){
    this.translate = function(x,y){
        
    }
    this.scale = function(x,y){
        
    }
    this.rotate = function(theta){
        
    }}
function Point ( x,  y) {
 this.x = x;
 this.y = y;
     this.x;
  this.getX = function(){
    return this.x;
  }
     this.y;
  this.getY = function(){
    return this.y;
  }

    this.minus = function(p){
        var pt;
var x;
x = this.x-p.x;
var y;
y = this.y-p.y;
pt = new Point(x,y);
    return pt;
    }}
function Color(){    this.RED = 'RED';
}
function Bounds ( x,  y,  w,  h) {
 this.x = x;
 this.y = y;
 this.w = w;
 this.h = h;
     this.x = 0;
  this.getX = function(){
    return this.x;
  }
     this.y = 0;
  this.getY = function(){
    return this.y;
  }
     this.w = 99;
  this.getW = function(){
    return this.w;
  }
     this.h = 99;
  this.getH = function(){
    return this.h;
  }

    this.containsBounds = function(b){
            if(b.x<this.x){
    return false;}
;
    if(b.x+b.w>this.x+this.w){
    return false;}
;
    if(b.y<this.y){
    return false;}
;
    if(b.y+b.h>this.y+this.h){
    return false;}
;
    return true;
    }}
function Events(){    this.Press = 'Press';
    this.Action = 'Action';
    this.Drag = 'Drag';
    this.Release = 'Release';
    this.ScrollV = 'ScrollV';
    this.ScrollH = 'ScrollH';
    this.KeyPress = 'KeyPress';
    this.KeyRelease = 'KeyRelease';
    this.KeyType = 'KeyType';
    this.AccelChanged = 'AccelChanged';
    this.LocationChanged = 'LocationChanged';
    this.OrientationChanged = 'OrientationChanged';
    this.JoystickChanged = 'JoystickChanged';
    this.AccelerometerChanged = 'AccelerometerChanged';
}
function XEvent(){     this.type;
  this.getType = function(){
    return this.type;
  }
  this.setType = function(Type){
    this.type=Type;
    this.markDirty();
    return this;
  }
     this.target;
  this.getTarget = function(){
    return this.target;
  }
  this.setTarget = function(Target){
    this.target=Target;
    this.markDirty();
    return this;
  }
     this.point;
  this.getPoint = function(){
    return this.point;
  }
  this.setPoint = function(Point){
    this.point=Point;
    this.markDirty();
    return this;
  }
     this.delta;
  this.getDelta = function(){
    return this.delta;
  }
  this.setDelta = function(Delta){
    this.delta=Delta;
    this.markDirty();
    return this;
  }
}
function Node(){     this.parent;
  this.getParent = function(){
    return this.parent;
  }
  this.setParent = function(Parent){
    this.parent=Parent;
    this.markDirty();
    return this;
  }
     this.visible = true;
  this.getVisible = function(){
    return this.visible;
  }
  this.setVisible = function(Visible){
    this.visible=Visible;
    this.markDirty();
    return this;
  }
     this.tx = 0;
  this.getTx = function(){
    return this.tx;
  }
  this.setTx = function(Tx){
    this.tx=Tx;
    this.markDirty();
    return this;
  }
     this.ty = 0;
  this.getTy = function(){
    return this.ty;
  }
  this.setTy = function(Ty){
    this.ty=Ty;
    this.markDirty();
    return this;
  }
     this.opacity = 1.0;
  this.getOpacity = function(){
    return this.opacity;
  }
  this.setOpacity = function(Opacity){
    this.opacity=Opacity;
    this.markDirty();
    return this;
  }

    this.getBounds = function(){
            return null;
    }
    this.draw = function(ctx){
        
    }
    this.contains = function(pt){
            return false;
    }
    this.markDirty = function(){
            if(this.parent!=null){
this.parent.markDirty()}

    }
    this.isParent = function(){
            return false;
    }}
function EventManager(){     this.mousestart;
  this.getMousestart = function(){
    return this.mousestart;
  }
  this.setMousestart = function(Mousestart){
    this.mousestart=Mousestart;
    this.markDirty();
    return this;
  }
     this.mouselast;
  this.getMouselast = function(){
    return this.mouselast;
  }
  this.setMouselast = function(Mouselast){
    this.mouselast=Mouselast;
    this.markDirty();
    return this;
  }
     this.dragFocus = null;
  this.getDragFocus = function(){
    return this.dragFocus;
  }
  this.setDragFocus = function(DragFocus){
    this.dragFocus=DragFocus;
    this.markDirty();
    return this;
  }
     this.keyboardFocus = null;
  this.getKeyboardFocus = function(){
    return this.keyboardFocus;
  }
  this.setKeyboardFocus = function(KeyboardFocus){
    this.keyboardFocus=KeyboardFocus;
    this.markDirty();
    return this;
  }

    this.findNode = function(point){
            return null;
    }
    this.toLocalCoords = function(point,node){
            return point;
    }
    this.createEvent = function(){
            return null;
    }
    this.fireEvent = function(event){
        
    }
    this.on = function(type,target,fn){
        
    }
    this.later = function(fn){
        
    }
    this.repeat = function(interval,fn){
        
    }
    this.processPointerEvent = function(type,point){
        var event;
event = this.createEvent();
event.type = type;
    if(type==Events.Press){
this.mousestart = point;
this.mouselast = point;
event.point = point}
;
    if(type==Events.Drag){
var delta;
delta = point.minus(this.mouselast);
event.delta = delta;
this.mouselast = point;
event.point = point}
;
var node;
node = this.findNode(point);
var point2;
point2 = this.toLocalCoords(point,node);
event.point = point2;
    if(type==Events.Press){
this.dragFocus = node;
this.keyboardFocus = node}
;
    if(type==Events.Drag){
    if(this.dragFocus!=null){
node = this.dragFocus}
}
;
    if(type==Events.Release){
this.dragFocus = null}
;
    if(node!=null){
event.target = node;
this.fireEvent(event)}

    }}
function PropAnim(){     this.target = null;
  this.getTarget = function(){
    return this.target;
  }
  this.setTarget = function(Target){
    this.target=Target;
    this.markDirty();
    return this;
  }
     this.name = null;
  this.getName = function(){
    return this.name;
  }
  this.setName = function(Name){
    this.name=Name;
    this.markDirty();
    return this;
  }
     this.loop = false;
  this.getLoop = function(){
    return this.loop;
  }
  this.setLoop = function(Loop){
    this.loop=Loop;
    this.markDirty();
    return this;
  }
     this.startvalue = 0;
  this.getStartvalue = function(){
    return this.startvalue;
  }
  this.setStartvalue = function(Startvalue){
    this.startvalue=Startvalue;
    this.markDirty();
    return this;
  }
     this.endvalue = 100;
  this.getEndvalue = function(){
    return this.endvalue;
  }
  this.setEndvalue = function(Endvalue){
    this.endvalue=Endvalue;
    this.markDirty();
    return this;
  }
     this.duration = 1000;
  this.getDuration = function(){
    return this.duration;
  }
  this.setDuration = function(Duration){
    this.duration=Duration;
    this.markDirty();
    return this;
  }
}
function Stage(){     this.eventManager;
  this.getEventManager = function(){
    return this.eventManager;
  }
  this.setEventManager = function(EventManager){
    this.eventManager=EventManager;
    this.markDirty();
    return this;
  }
     this.focused;
  this.getFocused = function(){
    return this.focused;
  }
  this.setFocused = function(Focused){
    this.focused=Focused;
    this.markDirty();
    return this;
  }
     this.root;
  this.getRoot = function(){
    return this.root;
  }
  this.setRoot = function(Root){
    this.root=Root;
    this.markDirty();
    return this;
  }

    this.redraw = function(){
        
    }
    this.markDirty = function(){
        
    }
    this.on = function(type,target,fn){
        
    }
    this.addAnim = function(anim){
        
    }
    this.findNode = function(id){
        
    }}
function Accelerometer(){
    this.isAvailable = function(){
            return false;
    }}
function Joystick(){
    this.isAvailable = function(){
            return false;
    }}
function Parent(){
    this.getChildCount = function(){
            return 0;
    }
    this.getChild = function(i){
            return null;
    }
    this.toInnerCoords = function(pt){
            return pt;
    }}
Parent.extend(Node);
function Transform(){     this.scalex = 1;
  this.getScalex = function(){
    return this.scalex;
  }
  this.setScalex = function(Scalex){
    this.scalex=Scalex;
    this.markDirty();
    return this;
  }
     this.scaley = 1;
  this.getScaley = function(){
    return this.scaley;
  }
  this.setScaley = function(Scaley){
    this.scaley=Scaley;
    this.markDirty();
    return this;
  }
     this.rotate = 0;
  this.getRotate = function(){
    return this.rotate;
  }
  this.setRotate = function(Rotate){
    this.rotate=Rotate;
    this.markDirty();
    return this;
  }
     this.child;
  this.getChild = function(){
    return this.child;
  }
  this.setChild = function(Child){
    this.child=Child;
    this.markDirty();
    return this;
  }
}
Transform.extend(Parent);
function Group(){     this.nodes;
  this.getNodes = function(){
    return this.nodes;
  }
  this.setNodes = function(Nodes){
    this.nodes=Nodes;
    this.markDirty();
    return this;
  }

    this.add = function(child){
        
    }
    this.clear = function(){
        
    }}
Group.extend(Parent);
function Clip(){     this.w = 10;
  this.getW = function(){
    return this.w;
  }
  this.setW = function(W){
    this.w=W;
    this.markDirty();
    return this;
  }
     this.h = 10;
  this.getH = function(){
    return this.h;
  }
  this.setH = function(H){
    this.h=H;
    this.markDirty();
    return this;
  }
}
Clip.extend(Group);
function Buffer(){     this.w;
  this.getW = function(){
    return this.w;
  }
  this.setW = function(W){
    this.w=W;
    this.markDirty();
    return this;
  }
     this.h;
  this.getH = function(){
    return this.h;
  }
  this.setH = function(H){
    this.h=H;
    this.markDirty();
    return this;
  }
}
function Rect(){     this.x = 0;
  this.getX = function(){
    return this.x;
  }
  this.setX = function(X){
    this.x=X;
    this.markDirty();
    return this;
  }
     this.y = 0;
  this.getY = function(){
    return this.y;
  }
  this.setY = function(Y){
    this.y=Y;
    this.markDirty();
    return this;
  }
     this.w = 10;
  this.getW = function(){
    return this.w;
  }
  this.setW = function(W){
    this.w=W;
    this.markDirty();
    return this;
  }
     this.h = 10;
  this.getH = function(){
    return this.h;
  }
  this.setH = function(H){
    this.h=H;
    this.markDirty();
    return this;
  }
     this.fill;
  this.getFill = function(){
    return this.fill;
  }
  this.setFill = function(Fill){
    this.fill=Fill;
    this.markDirty();
    return this;
  }

    this.contains = function(pt){
            if(pt.x<this.x){
    return false;}
;
    if(pt.x>this.x+this.w){
    return false;}
;
    if(pt.y<this.y){
    return false;}
;
    if(pt.y>this.y+this.h){
    return false;}
;
    return true;
    }}
Rect.extend(Node);
function Circle(){     this.cx = 0;
  this.getCx = function(){
    return this.cx;
  }
  this.setCx = function(Cx){
    this.cx=Cx;
    this.markDirty();
    return this;
  }
     this.cy = 0;
  this.getCy = function(){
    return this.cy;
  }
  this.setCy = function(Cy){
    this.cy=Cy;
    this.markDirty();
    return this;
  }
     this.radius = 100;
  this.getRadius = function(){
    return this.radius;
  }
  this.setRadius = function(Radius){
    this.radius=Radius;
    this.markDirty();
    return this;
  }
     this.fill;
  this.getFill = function(){
    return this.fill;
  }
  this.setFill = function(Fill){
    this.fill=Fill;
    this.markDirty();
    return this;
  }

    this.contains = function(pt){
            if(pt.x<this.cx-this.radius){
    return false;}
;
    if(pt.x>this.cx+this.radius){
    return false;}
;
    if(pt.y<this.cy-this.radius){
    return false;}
;
    if(pt.y>this.cy+this.radius){
    return false;}
;
    return true;
    }}
Circle.extend(Node);
function ParallelAnim(){
    this.add = function(){
        
    }}
function SerialAnim(){
    this.add = function(){
        
    }}
function Control(){     this.x = 0;
  this.getX = function(){
    return this.x;
  }
  this.setX = function(X){
    this.x=X;
    this.markDirty();
    return this;
  }
     this.y = 0;
  this.getY = function(){
    return this.y;
  }
  this.setY = function(Y){
    this.y=Y;
    this.markDirty();
    return this;
  }
     this.w = 100;
  this.getW = function(){
    return this.w;
  }
  this.setW = function(W){
    this.w=W;
    this.markDirty();
    return this;
  }
     this.h = 30;
  this.getH = function(){
    return this.h;
  }
  this.setH = function(H){
    this.h=H;
    this.markDirty();
    return this;
  }
     this.leftanchored = false;
  this.getLeftanchored = function(){
    return this.leftanchored;
  }
  this.setLeftanchored = function(Leftanchored){
    this.leftanchored=Leftanchored;
    this.markDirty();
    return this;
  }
     this.rightanchored = false;
  this.getRightanchored = function(){
    return this.rightanchored;
  }
  this.setRightanchored = function(Rightanchored){
    this.rightanchored=Rightanchored;
    this.markDirty();
    return this;
  }
     this.topanchored = false;
  this.getTopanchored = function(){
    return this.topanchored;
  }
  this.setTopanchored = function(Topanchored){
    this.topanchored=Topanchored;
    this.markDirty();
    return this;
  }
     this.bottomanchored = false;
  this.getBottomanchored = function(){
    return this.bottomanchored;
  }
  this.setBottomanchored = function(Bottomanchored){
    this.bottomanchored=Bottomanchored;
    this.markDirty();
    return this;
  }
     this.baseColor;
  this.getBaseColor = function(){
    return this.baseColor;
  }
  this.setBaseColor = function(BaseColor){
    this.baseColor=BaseColor;
    this.markDirty();
    return this;
  }

    this.contains = function(pt){
            if(pt.x<this.x){
    return false;}
;
    if(pt.x>this.x+this.w){
    return false;}
;
    if(pt.y<this.y){
    return false;}
;
    if(pt.y>this.y+this.h){
    return false;}
;
    return true;
    }}
Control.extend(Node);
function PushButton(){     this.textColor;
  this.getTextColor = function(){
    return this.textColor;
  }
  this.setTextColor = function(TextColor){
    this.textColor=TextColor;
    this.markDirty();
    return this;
  }
     this.text;
  this.getText = function(){
    return this.text;
  }
  this.setText = function(Text){
    this.text=Text;
    this.markDirty();
    return this;
  }
     this.pressed = false;
  this.getPressed = function(){
    return this.pressed;
  }
  this.setPressed = function(Pressed){
    this.pressed=Pressed;
    this.markDirty();
    return this;
  }
}
PushButton.extend(Control);
function ToggleButton(){     this.selected = false;
  this.getSelected = function(){
    return this.selected;
  }
  this.setSelected = function(Selected){
    this.selected=Selected;
    this.markDirty();
    return this;
  }
     this.textColor;
  this.getTextColor = function(){
    return this.textColor;
  }
  this.setTextColor = function(TextColor){
    this.textColor=TextColor;
    this.markDirty();
    return this;
  }
     this.accentColor;
  this.getAccentColor = function(){
    return this.accentColor;
  }
  this.setAccentColor = function(AccentColor){
    this.accentColor=AccentColor;
    this.markDirty();
    return this;
  }
     this.text;
  this.getText = function(){
    return this.text;
  }
  this.setText = function(Text){
    this.text=Text;
    this.markDirty();
    return this;
  }
}
ToggleButton.extend(Control);
function Label(){     this.textColor;
  this.getTextColor = function(){
    return this.textColor;
  }
  this.setTextColor = function(TextColor){
    this.textColor=TextColor;
    this.markDirty();
    return this;
  }
     this.text;
  this.getText = function(){
    return this.text;
  }
  this.setText = function(Text){
    this.text=Text;
    this.markDirty();
    return this;
  }
     this.fontsize = 12;
  this.getFontsize = function(){
    return this.fontsize;
  }
  this.setFontsize = function(Fontsize){
    this.fontsize=Fontsize;
    this.markDirty();
    return this;
  }
}
Label.extend(Control);
function ImageView(){     this.url;
  this.getUrl = function(){
    return this.url;
  }
  this.setUrl = function(Url){
    this.url=Url;
    this.markDirty();
    return this;
  }
     this.autoscale = false;
  this.getAutoscale = function(){
    return this.autoscale;
  }
  this.setAutoscale = function(Autoscale){
    this.autoscale=Autoscale;
    this.markDirty();
    return this;
  }
     this.scaletofit = true;
  this.getScaletofit = function(){
    return this.scaletofit;
  }
  this.setScaletofit = function(Scaletofit){
    this.scaletofit=Scaletofit;
    this.markDirty();
    return this;
  }
}
ImageView.extend(Control);
function Slider(){     this.accentColor;
  this.getAccentColor = function(){
    return this.accentColor;
  }
  this.setAccentColor = function(AccentColor){
    this.accentColor=AccentColor;
    this.markDirty();
    return this;
  }
     this.minvalue = 0;
  this.getMinvalue = function(){
    return this.minvalue;
  }
  this.setMinvalue = function(Minvalue){
    this.minvalue=Minvalue;
    this.markDirty();
    return this;
  }
     this.maxvalue = 100;
  this.getMaxvalue = function(){
    return this.maxvalue;
  }
  this.setMaxvalue = function(Maxvalue){
    this.maxvalue=Maxvalue;
    this.markDirty();
    return this;
  }
     this.value = 50;
  this.getValue = function(){
    return this.value;
  }
  this.setValue = function(Value){
    this.value=Value;
    this.markDirty();
    return this;
  }
}
Slider.extend(Control);
function Textbox(){     this.text;
  this.getText = function(){
    return this.text;
  }
  this.setText = function(Text){
    this.text=Text;
    this.markDirty();
    return this;
  }
}
Textbox.extend(Control);
function Spinner(){     this.active = false;
  this.getActive = function(){
    return this.active;
  }
  this.setActive = function(Active){
    this.active=Active;
    this.markDirty();
    return this;
  }
}
Spinner.extend(Control);
function AnchorPanel(){     this.nodes;
  this.getNodes = function(){
    return this.nodes;
  }
  this.setNodes = function(Nodes){
    this.nodes=Nodes;
    this.markDirty();
    return this;
  }

    this.add = function(child){
        
    }}
AnchorPanel.extend(Control);
function ListView(){     this.data;
  this.getData = function(){
    return this.data;
  }
  this.setData = function(Data){
    this.data=Data;
    this.markDirty();
    return this;
  }
     this.selectedIndex = 0;
  this.getSelectedIndex = function(){
    return this.selectedIndex;
  }
  this.setSelectedIndex = function(SelectedIndex){
    this.selectedIndex=SelectedIndex;
    this.markDirty();
    return this;
  }
     this.selectedObject = null;
  this.getSelectedObject = function(){
    return this.selectedObject;
  }
  this.setSelectedObject = function(SelectedObject){
    this.selectedObject=SelectedObject;
    this.markDirty();
    return this;
  }
}
ListView.extend(Control);
function FlickrQuery(){     this.active = false;
  this.getActive = function(){
    return this.active;
  }
  this.setActive = function(Active){
    this.active=Active;
    this.markDirty();
    return this;
  }
     this.execute = false;
  this.getExecute = function(){
    return this.execute;
  }
  this.setExecute = function(Execute){
    this.execute=Execute;
    this.markDirty();
    return this;
  }
     this.w;
  this.getW = function(){
    return this.w;
  }
  this.setW = function(W){
    this.w=W;
    this.markDirty();
    return this;
  }
     this.h;
  this.getH = function(){
    return this.h;
  }
  this.setH = function(H){
    this.h=H;
    this.markDirty();
    return this;
  }
     this.tx;
  this.getTx = function(){
    return this.tx;
  }
  this.setTx = function(Tx){
    this.tx=Tx;
    this.markDirty();
    return this;
  }
     this.ty;
  this.getTy = function(){
    return this.ty;
  }
  this.setTy = function(Ty){
    this.ty=Ty;
    this.markDirty();
    return this;
  }
     this.query;
  this.getQuery = function(){
    return this.query;
  }
  this.setQuery = function(Query){
    this.query=Query;
    this.markDirty();
    return this;
  }
     this.results;
  this.getResults = function(){
    return this.results;
  }
  this.setResults = function(Results){
    this.results=Results;
    this.markDirty();
    return this;
  }
     this.visible;
  this.getVisible = function(){
    return this.visible;
  }
  this.setVisible = function(Visible){
    this.visible=Visible;
    this.markDirty();
    return this;
  }
}
function Core(){
    this.createStage = function(){
            return null;
    }
    this.createGroup = function(){
            return null;
    }
    this.createTransform = function(){
            return null;
    }
    this.createRect = function(){
            return null;
    }
    this.createCircle = function(){
            return null;
    }
    this.createPushButton = function(){
            return null;
    }
    this.createToggleButton = function(){
            return null;
    }
    this.createTextbox = function(){
            return null;
    }
    this.createLabel = function(){
            return null;
    }
    this.createSlider = function(){
            return null;
    }
    this.start = function(fn){
        
    }}
function SimpleTest(){
    this.run = function(core,stage){
        var rect;
rect = core.createRect();
rect.setW(100);
rect.setH(100);
var circle;
circle = core.createCircle();
circle.setCx(200);
circle.setCy(200);
circle.setRadius(40);
var c2;
c2 = circle.setCx(300);
var g;
g = core.createGroup();
g.add(rect);
g.add(circle);
stage.setRoot(g)
    }}
    
    
exports.Point = Point;
exports.Node = Node;
exports.PushButton = PushButton;
exports.ToggleButton = ToggleButton;
exports.Slider = Slider;
exports.Label = Label;
exports.AnchorPanel = AnchorPanel;
exports.Transform = Transform;
exports.ListView = ListView;
exports.Textbox = Textbox;
