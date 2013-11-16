var util = require('util');
var os = require('os');
var amino   = require('../../build/desktop/amino.js');
var widgets = require('../../build/desktop/widgets.js');
var moment = require('moment');

var lasttime = null;

exports.buildApp = function(panel, core, stage, db) {
    
    //date and time
    var time = new widgets.Label().setText("12:45pm").setFontSize(30).setH(15);
    panel.add(time);
    var date = new widgets.Label().setText("10/11/13").setFontSize(15).setH(15);
    panel.add(date);
    
    //weather
    var weather = new widgets.Label().setText("65 cloudy").setFontSize(15).setH(15);
    panel.add(weather);
    
    //cpu monitor
    var cpu = new widgets.Label().setText("cpu").setFontSize(15).setH(15);
    panel.add(cpu);
    
    lasttime = os.cpus()[0].times;
    setInterval(function() {
        time.setText(moment().format('h:mm:ss a'));
        date.setText(moment().format('MMM Do'));
        weather.setText("66deg sunny");
        
        var thistime = os.cpus()[0].times;
        //console.log(lasttime,thistime);
        //cpu.setText("cpu "+os.cpus()[0].times.user);
        var user = thistime.user - lasttime.user;
        var idle = thistime.idle - lasttime.idle;
        var sys  = thistime.sys  - lasttime.sys;
        //console.log("user = " + user + " sys " + sys + " idle " + idle)
        var per = (user+sys)/(user+sys+idle);
        cpu.setText("cpu = " + (per*100).toFixed(1)+"%");
        lasttime = thistime;
    },1000);

    
    return panel;
}
