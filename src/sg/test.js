/** 
@class SGNode
@desc the base of all nodes 
*/

function SGNode() {
	this.live = false;
	
	this.createProp = function(name,handle) {
		this["set"+camelize(name)] = function(v) {
			this[name] = v;
			if(this.live) {
			    if(!propsHash[name]) {
			        console.log("WARNING: no prop key for " + name + " " + this.id);
			    }
				sgtest.updateProperty(handle, propsHash[name],v);
				if(this.propertyUpdated) {
				    this.propertyUpdated(name,v);
				}
			}
			return this;
		};
		this["get"+camelize(name)] = function() {
			return this[name];
		};
	}
	
	this.setProp = function(handle, name, value) {
		if(handle == null)  console.log("WARNING can't set prop " + name + ", the handle is null");
		sgtest.updateProperty(handle, propsHash[name],value);
	}

    
	this.delegateProps = function(props, handle) {
		for(var name in props) {
			this[name] = props[name]; //set the initial value
			this.createProp(name,handle);
			sgtest.updateProperty(handle, propsHash[name], props[name]);
		}
	}
	
	/** @prop id  identifier for the node. can be used to find it in the tree. */
	this.id = "noid";
	this.setId = function(id) {
		this.id = id;
		return this;
	}
	this.getId = function() {
	    return this.id;
	}
	
	/** @func getParent returns this node's parent, if any */
	this.getParent = function() {
	    return this.parent;
	}
	
	/** @prop visible indicates if node is visible or not. 
	Non-visible nodes are not drawn to the screen. */
	this.visible = true;
    this.setVisible = function(visible) {
        this.visible = visible;
        this.setProp(this.handle,'visible',visible?1:0);            
        return this;
    }	
    this.getVisible = function() {
        return this.visible;
    }
}

/** 
@class Rect 
@desc  A simple rectangle with a fill color. No border. */
function SGRect() {
	SGNode(this);
    this.init = function() {
        this.handle = sgtest.createRect();
        console.log("==== handle = " + this.handle);
        this.live = true;
        /** @prop tx  translate x. defaults to 0 */
        /** @prop ty  translate y. defaults to 0 */
        /** @prop x  left edge of the rect . defaults to 0 */
        /** @prop y  top edge of the rect. defaults to 0 */
        /** @prop w  width of the rect. defaults to 100 */
        /** @prop h  height of the rect. defaults to 100 */
        
        var props = { tx:0, ty:0, x:0, y:0, w:100, h:100, r: 0, g: 1, b:0, scalex: 1, scaley:1, rotateZ: 0, rotateX:0, rotateY: 0, visible:1 };
        this.delegateProps(props,this.handle);
        this.setFill = function(color) {
            color = ParseRGBString(color);
            this.setProp(this.handle,'r',color.r);
            this.setProp(this.handle,'g',color.g);
            this.setProp(this.handle,'b',color.b);
            return this;
        }
        this.getFill = function() {
            return this.color;
        }
    }
    this.contains = function(x,y) {
        if(x >=  this.getX()  && x <= this.getX() + this.getW()) {
            if(y >= this.getY() && y <= this.getY() + this.getH()) {
                return true;
            }
        }
        return false;
    }
}
SGRect.extend(SGNode);

