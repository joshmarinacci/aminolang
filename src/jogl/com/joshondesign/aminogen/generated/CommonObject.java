package com.joshondesign.aminogen.generated;

import com.joshondesign.aminogen.custom.CoreImpl.EventManager;
import com.joshondesign.aminogen.custom.CoreImpl.ICallback;

public class CommonObject {
    protected void markDirty() {
    }
    
    protected void on(Object type, ICallback cb) {
        EventManager.get().on(type,this,cb);
    }
    
    protected void fire(Object type) {
        EventManager.get().fire(type,this);
    }
}

