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
currently load that file along with the src/jscanvas files to have a valid
library. See tests/general.html for an example of loading the file and putting
some shapes and widgets on the screen.

Amino on the Mac desktop
========================

Amino on the Mac desktop use NodeJS with a native add-on to wrap OpenGL and GLFW. Generate the native node module:

```
node-gyp clean configure build
```

Then run the test app with

```
node tests/general.js
```


Amino on headless Android
=========================


Amino can be run with NodeJS on Android from the command line on developer
unlocked devices running Android 4.1.x. It does not use Java/Dalvik and does not
require the full Android stack. It uses OpenGL directly. Node and V8 are tricky
to build so I've put prebuilt binaries in the prebuilt directory. To build the
native module you must have the Android OS source setup and built on your
machine. Copy or link `aminolang` into `android_src/external`. Cd to external
and run `mm` to build it. You may need to link in the node JS source as well for
the header files. Copy the resulting generated so file to the aminolang
directory as `aminonative.node`. Run `node devicephone` to push everything over
to your USB attached Android phone using ADB.

Test it with:

```
adb root
adb shell
cd /data/phonetest 
export LD_LIBRARY_PATH=/data/phonetest
./node nodetest.js
```





