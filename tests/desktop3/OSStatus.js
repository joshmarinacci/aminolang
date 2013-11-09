var util = require('util');
var os = require('os');
var amino   = require('../../build/desktop/amino.js');
var widgets = require('../../build/desktop/widgets.js');
var moment = require('moment');

exports.buildApp = function(core, stage, db) {
    var panel = new widgets.VerticalPanel();
    panel.isApp = function() { return true; }
    panel.getTitle = function() { return "Status"; }
    
    //date and time
    var time = new widgets.Label().setText("12:45pm");
    panel.add(time);
    var date = new widgets.Label().setText("10/11/13");
    panel.add(date);
    
    //weather
    var weather = new widgets.Label().setText("65 cloudy");
    panel.add(weather);
    
    //cpu monitor
    var cpu = new widgets.Label().setText("cpu");
    panel.add(cpu);
    
    setInterval(function() {
        time.setText(moment().format('h:mm:ss a'));
        date.setText(moment().format('MMM Do'));
        weather.setText("66deg sunny");
        cpu.setText("cpu "+os.cpus()[0].times.user);
    },1000);

    
    return panel;
}
