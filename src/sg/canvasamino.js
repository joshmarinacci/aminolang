console.log("inside the canvas amino");
console.log("exported amino = ", this['mymodule']);

var amino = this['mymodule'];
amino.sgtest = {
    init: function() {
        console.log("canvas amino doesn't really do an init");
    },
    setEventCallback: function(cb) {
        console.log("pretending to set an event callback");
    },
    createWindow: function(w,h) {
        console.log("pretending to open an window:",w,h);
    },
    createRect: function() {
        return {
            "kind":"CanvasRect",
        }
    },
    updateProperty: function(handle, key, value) {
        console.log("updating the property of handle",handle,key,value);
    },
    
}
amino.bacon = Bacon;
amino.createDefaultFont = function() {
    return {};
}
amino.startApp = function(id, cb) {
    Core._core = new Core();
    Core._core.init();
    var stage = Core._core.createStage(600,600);
    cb(Core._core,stage);
    Core._core.start();
}
