console.log("inside the canvas amino");
console.log("exported amino = ", this['mymodule']);

var amino = this['mymodule'];
amino.sgtest = {
}
amino.native = {
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
    setRoot: function(root) {
        console.log("setting the root to",root);
    },
    tick: function() {
        console.log("canvas ticking");
    },
    setImmediate: function(loop) {
        setTimeout(loop,1000);
    }
};

amino.bacon = Bacon;
amino.createDefaultFont = function() {
    return {};
}
amino.startApp = function(id, cb) {
    var domcanvas = document.getElementById(id);
    console.log("dom canvas = ",domcanvas);
    amino.native.domctx = domcanvas.getContext('2d');
    Core._core = new Core();
    Core._core.init();
    var stage = Core._core.createStage(600,600);
    cb(Core._core,stage);
    Core._core.start();
}
