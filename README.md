Amino Lang
=========

Amino Lang is a multi-language 2d/3d scene graph library for multiple target
languages. It lets you build applications out of reusable widgets, shapes, and
transitions that animate smoothly. It currently targets JavaScript in the
browser (canvas), Mac desktop, and headless Android using direct OpenGL and
NodeJS, as well as nascent Java2D and JOGL versions using Java. Scenes can be
created with clean hand coding or by loading a JSON description file. A desktop
GUI builder to generate the JSON files is forthcoming.

To see the build targets run

```
node build
```

Amino in the browser
=====================

```
node build jscanvasgen
```

This will generate `build/jscanvas/out.js` scene graph bindings. You must
currently load that file along with the `src/jscanvas` files to have a valid
library. See `tests/general.html` for an example of loading the file and putting
some shapes and widgets on the screen.

Amino on the Mac desktop
========================

Amino on the Mac desktop use NodeJS we use GLWF and a native add-on. To build it first install Brew.
It's the package manager for Mac that you've always wanted. Then install libpng, libjpeg, and libglfw with
it. Finally generate the native node module:

```
node-gyp clean configure build
```

put in the missing pure js deps
```
sudo npm-install wrench
```

build the pure js parts
```
node build desktopbuild
```

Then run the test app with

```
node tests/general.js
```


Amino on Android
=========================

Amino can be run with NodeJS on Android from the command line on developer
unlocked devices running Android 4.1.x. It does not use Java/Dalvik and does not
require the full Android stack. It uses OpenGL directly. Node and V8 are tricky
to build so I've put pre-built binaries in the `prebuilt` directory. To build
the native module you must have the Android OS source setup and built on your
machine. Copy or link `aminolang` into `android_src/external`. Cd to
`external/aminolang/` and run `mm` to build it. You may need to link in the
NodeJS source as well for the header files. Copy the resulting generated `.so`
file to the aminolang project root directory as `aminonative.node`. Run `node
build androidtest` to push everything over to your USB attached Android phone using
ADB.

Run the demo app (a phone UI mockup) with:

```
adb root
adb shell
cd /data/phonetest 
export LD_LIBRARY_PATH=/data/phonetest
chmod 755 node
./node phone3.js
```


Amino on Linux
=========================

install node.

```
https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager
```

install node-gyp

```
sudo npm install -g node-gyp
```


install glfw

```
sudo apt-get install libglfw2 libglfw-dev ﻿libpng12-dev libjpeg-dev
```

Note that on virtual box there is a bug which upgrading vbox doesn't fix. This prevents windows from opening. To fix it
we need GLFW version 2.7.5 or greater. Unfortunately Ubuntu still ships with a more than a year old GLFW, so I had to
remove the default and build/install GLFW from source. Once that is done it should work.

Install git and check out the code.  build it with node-gyp

```
node-gyp clean configure build
```

put in the missing pure js deps
```
sudo npm-install wrench
```

build the pure js parts
```
node build desktopbuild
```

run the test app
```
node tests/general.js
```



Usage
========

Amino is very much in flux. It recently received a new much lower level backend
which only provides groups, rectangles, images, and text nodes. More will come later
but you can do a lot with just these.  Here is a simple example:

```
var Core = require('./amino.js'); //change to wherever you end up putting amino

//stage will be created for us already
Core.startApp(function(core,stage) {
        
    //always use a group for your scene root
    var group = core.createGroup();
    core.setRoot(group);
    
    
    //button
    var button = core.createPushButton();
    button.setText("Activate!");
    button.setFontSize(40);
    button.setTx(0);
    button.setTy(0);
    button.setW(200);
    button.setH(80);
    group.add(button);

    var rect = core.createRect()
        .setW(200)
        .setH(80)
        .setTx(0)
        .setTy(300)
        .setFill("#33FFDD");
    group.add(rect);
        
    
    core.on("action",button, function() {
        console.log("you activated the button");
        //create an animation
        // tx goes from 0 to 400 over 600ms. do it once (1). no auto reverse
        var anim = core.createPropAnim(rect,"tx",0, 400, 600, 1, false);
        //optional
        anim.setInterpolator(Core.Interpolators.CubicInOut);
    });
    
       
    
});
```




