Amino
=====


Amino is a light weight NodeJS scene graph API backed by OpenGL ES 2.0. It can
also run in the browser with HTML Canvas. Amino is focused on being portable,
hardware accelerated, and easy to use.

Amino runs on Mac, Linux, Raspberry Pi, and headless Android. On the Pi it does not
use X Windows, but rather works fullscreen directly with hardware for maximum
performance.

Amino is not an application framework. It is simply a graphics and input api to
quickly build your apps on top of. Amino can be used for data visualization,
games, photo manipulation, particle effects, and (to a limited extent) form
driven applications. Amino comes with a simple widget set (buttons, sliders,
lists, etc.), but it is optional and can be replaced.

Example
=======

This code creates a group holding a button, textfield, and rectangle. The
rectangle will follow the cursor. Notice that you can chain setters to make your
code simpler. All properties have reasonable defaults. For example
`rect.setTx(0)` is not needed since the default for tx is already zero.

Read the API docs for details on each of the widgets.
http://joshondesign.com:9001/job/aminolang%20docs/lastSuccessfulBuild/artifact/build/docs/index.html


```
var amino = require('amino.js');
var widgets= require('widgets.js');
amino.startApp(function(core, stage) {
    var group = new amino.ProtoGroup();
    stage.setRoot(group);

    var button = new widgets.PushButton()
        .setText("a button")
        .setTx(50).setTy(50).setW(150).setH(30);
    group.add(button);


    var textfield = new widgets.TextField()
        .setTx(50).setTy(100).setW(150).setH(30);
    group.add(textfield);

    var rect = new amino.ProtoRect()
        .setW(10).setH(10).setFill("#33cc44");
    group.add(rect);
    core.on("move",null,function(e) {
        rect.setTx(e.x+1);
        rect.setTy(e.y+1);
    });

});
```

Status and Roadmap
==================

Amino is still in alpha and does not have pre-built binaries. You will have to build
from source. The current release is version 0.5

* 0.5
 * docs
 * hook up more demos
* 0.6
 * generalize input support on Raspberry Pi
 * refactor font support
 * expose direct OpenGL access
 * switch to depth buffer rendering for greater speed
* 0.7
 * flesh out the widget set
 * support two themes for widgets (light and dark)
* 1.0
 * downloadable binary builds


Build for Mac
==============

Amino on the Mac desktop uses GLWF and a native add-on. To build it first
install Brew [link=http://brew.sh/], the package manager for Mac that you've
always wanted. Then install libpng, libjpeg, and libglfw with it like so.

```
brew install glfw2 libpng libjpeg
```

compile the native module
```
cd aminolang
node-gyp clean configure build
```

build the Javascript parts
```
node build desktop
```

Run a test app to make sure everything is in place.

```
export NODE_PATH=build/desktop
node tests/examples/simple.js
```


Build for Raspberry Pi
=======================

Amino on Raspberry Pi uses RPi specific bindings to the screen and input events. You need
libpng, libjpeg, and of course NodeJS installed.

```
sudo apt-get install libpng libjpeg
```

If you don't have node installed on the Pi yet, follow these instructions here.
http://joshondesign.com/2013/10/23/noderpi


Now build the native module. Note the `--OS` setting.

```
cd aminolang
node-gyp clean configure --OS=raspberrypi build
```

The native build will take a while. Go get some coffee. A big coffee.

Now build the JS parts and run a test app.

```
node build desktop
export NODE_PATH=build/desktop
node tests/examples/simple.js
```

Note that XWindows cannot be running when you do this. Amino works directly with
the screen. You may need to configure your Raspberry Pi to give you a plain
console at boot.


Build for Linux
================

First you need node, npm, and node-gyp installed. Then you'll need glfw,
freetype, libpng, and libjpeg. Install them with:

```
apt-get install libglfw2 libglfw-dev libfreetype6-dev libjpeg-dev libpng-dev
```

Check out the source then build the native module:
```
cd aminolang
node-gyp clean configure build
```

If that succeeds then build JS parts and run the test app
```
node build desktop
export NODE_PATH=build/desktop
node tests/examples/simple.js
```

That's it. This will run under X-Windows, though I can't say how fast it will
be. Depends on having OpenGL configured properly on your Linux box.


Build for Browser
=================

There's no native part or extra deps. Just build the canvas module.

```
node build canvas
```

Then open the test/examples/simple.js file in your browser. Depending on your
security settings you may need to run through a local webserver.


Amino on Headless Android
=========================

Amino can be run with NodeJS on Android / ASOP from the command line on developer
unlocked devices running Android 4.x.x. It does not use Java/Dalvik and does not
require the full Android stack. It uses OpenGL directly.

Node and V8 are tricky to build for Android so I've put pre-built binaries in
the `prebuilt` directory. To build the native module you must have the Android
OS source setup and built on your machine. Copy or link `aminolang` into
`android_src/external`. Cd to `external/aminolang/` and run `mm` to build it.
You may need to link in the NodeJS source as well for the header files. Copy the
resulting generated `.so` file to the aminolang project root directory as
`aminonative.node`. Run `node build androidtest` to push everything over to your
USB attached Android phone using ADB.

Run the demo app (a phone UI mockup) with:

```
adb root
adb shell
cd /data/phonetest
export LD_LIBRARY_PATH=/data/phonetest
chmod 755 node
./node phone3.js
```



linux

```
sudo apt-get install libglfw2 libglfw-dev ﻿libpng12-dev libjpeg-dev
```

Note that on virtual box there is a bug which upgrading vbox doesn't fix. This prevents windows from opening. To fix it
we need GLFW version 2.7.5 or greater. Unfortunately Ubuntu still ships with a more than a year old GLFW, so I had to
remove the default and build/install GLFW from source. Once that is done it should work.

Install git and check out the code.  build it with node-gyp


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




### build notes

to get better details on native build failures

```
node-gyp rebuild --verbose
```

```
node-gyp rebuild
node build desktop
export NODE_PATH=~/projects/aminolang/build/desktop
node tests/desktop3/start.js
```
