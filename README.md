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
but you can do a lot with just these. Amino provides a few simple widgets which
are composed of the primitive nodes. Here is a simple example using Group,
Rect, and a PushButton.

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

Notice that you can chain setters to make your code simpler. All properties
have reasonable defaults so you don't need to set them all. In the code
above the `setTx(0)` on the rect is unecessary since the default for tx is
already zero.

Read the API docs for details on each of the widgets.

### ListView

Most widgets are pretty simple. Create them, set a few properties, add them to your scene.  
`ListView` is not. You'll have to do some customization to make it useful. For example,
assume you had an array called `people` which contains simple objects, each with `first` and 
`last` properties. To show this array in a ListView you would set the listModel variable, 
then set a TextCellRenderer to populate each cell of the list. ex:

```
var view = new widgets.ListView();
view.setW(300).setH(500);
view.listModel = people; // the array of people objects
view.setTextCellRenderer(function(cell, index, item) {
    cell.setText(item.first + " " + item.last);
});
```

You can further customize the list cell by setting the background color.
For example, to alternate colors on each line, do:
```
view.setTextCellRenderer(function(cell,index,item) {
    cell.setText(item.first + " " + item.last);
    if(i%2 == 0) {
        cell.setFill("#ffffff");
    } else {
        cell.setFill("#eeeeee");
    }
});
```


If you need a more complex ListCell than the default one, you can
create your own class and build them by setting a new `cellGenerator` function.
This generator function will be called every time the view needs a new
cell. Your function should return an instance of your custom cell class.

For example, if you needed a list of emails where each cell had two text
strings, one for the subject and one for the sender, you could do it like this:

```
var EmailListViewCell = amino.ComposeObject({
    type: "EmailListViewCell",
    extend: amino.ProtoWidget,
    comps: {
        background: {
            proto: amino.ProtoRect,
            promote: ['w','h','fill'],
        },
        from: {
            proto: amino.ProtoText,
        },
        subject: {
            proto: amino.ProtoText,
        },
    },
    init: function() {
        this.comps.base.add(this.comps.background);
        this.comps.base.add(this.comps.from);
        this.comps.base.add(this.comps.subject);
        
        this.comps.from.setText("from");
        this.comps.from.setTx(5);
        this.comps.from.setTy(5);
        this.comps.from.setFontSize(16);

        this.comps.subject.setText("subject");
        this.comps.subject.setTx(5);
        this.comps.subject.setTy(25);
        this.comps.subject.setFontSize(12);
    },
});
```

Then set the generator like this:

```
view.setCellGenerator(function() {
    return new EmailListViewCell();
});
view.setTextCellRenderer(function(cell,index,item) {
    cell.comps.from.setText(item.from);
    cell.comps.subject.setText(item.subject);
});
```


### Fonts

We've just switched to a new renderer based on freetype-gl but it is only
barely integrated so far.  There is not yet an api to dynamically load
new fonts, nor is it smart about cleaning the cache.  This means you can
currently only choose from two fonts at just four different sizes.  

Set the font with setFontName on the nodes which support it (basically ProtoText
and the widgets which wrap it). Valid values are 'source' and 'awesome'. 'source' is
Source Sans Pro.  'awesome' is Font Awesome. Set the font size with setFontSize().
The valid values are 10,12,15,20, and 40.

https://code.google.com/p/freetype-gl/

http://fortawesome.github.io/Font-Awesome/

To use a glyph from Font Awesome refer to the Font Awesome docs to get the
unicode number for the glyph you want, then use it in a string with the
'\u' prefix.  For example, the cloud icon is documented on
[this][http://fortawesome.github.io/Font-Awesome/icon/cloud/] page. It's
unicode number is F0C2. So you can create a label with

```
var label = new widgets.Label()
    .setFontName('awesome')
    .setText('\uF0C2');
```


### Canvas

The canvas implementation is the most immature.  It shares the same JS code with the
rest of Amino but has no native back end. Instead it runs in the browser using
the HTML Canvas 2D apis.  This means you will not get any 3D transforms.

The API for Canvas is the same as desktop and mobile, but initialized slightly
differently. Also, animation does not currently work.

Build the canvas version with `node build canvas` then create an html page
with code like this:

```
<html>
<head>
<script src='../build/canvas/amino.js'></script>
<script src='../build/canvas/widgets.js'></script>
<script src='../build/canvas/canvasbacon.js'></script>
<script src='../build/canvas/canvasamino.js'></script>
<script src='generalutil.js'></script>
<style type="text/css">
canvas { border: 1px solid black; }
</style>
</head>
<body>
<canvas id='mycanvas' width='600' height='300'></canvas>
<script language="JavaScript">
amino.startApp("mycanvas",function(core,stage) {
    var root = new amino.ProtoGroup();
    stage.setRoot(root);
});
</script>
</body>
</html>
```

Notice the path must be correct for the script imports. Also notice that
amino.startApp has an extra parameter: the ID of the canvas to attach to.
Other than that the API should be the same. 




