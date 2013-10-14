if(typeof document == "undefined") {
    var  widgets= require('widgets.js'); 
    var amino = require('amino.js');
    var fs = require('fs');
    var util = require('util');
    var sys = require('sys');
}

//stage will be created for us already
amino.startApp(function(core,stage) {
    var wsize = amino.native.getWindowSize();
    var ww = wsize.w;
    function getWW() {
        return ww;
    }
    var wh = wsize.h;
    function getWH() {
        return wh;
    }
    var slidespeed=600;
    function getSlideSpeed(){
	return slidespeed;
    }

    //always use a group for your scene root
    var groupRoot = new amino.ProtoGroup();
    var groupMain = new amino.ProtoGroup();
    var groupBackground = new amino.ProtoGroup();

    // set up the background
    var imagew;                                        
    var imageh;                                            
    if(ww < wh) {               
       imagew = 1920 * wh/1280;        
       imageh = wh;            
    } else {                                              
       imagew = ww;                                                                                
       imageh = 1280 * ww/1920;                            
    }                                         
    var rootimage = new amino.ProtoImageView(); 
    rootimage.setSrc("/system/examples/nexus/qml/homescreen/mutual_paper_by_apofiss-d3fuvv2.jpg");
    rootimage.setTx((ww-imagew)/2.0).setTy((wh-imageh)/2.0).setW(imagew).setH(imageh);                      
    groupBackground.add(rootimage);

    var labelTitle = new widgets.Label();
    labelTitle.setText("Widget Gallery");
    labelTitle.setFontSize(40);
    labelTitle.setTx(getWW()/2-80);
    labelTitle.setValign("top");
    //labelTitle.setH(120);

    var buttonPB = new widgets.PushButton();
    buttonPB.setText("PushButton");
    buttonPB.setFontSize(40);

    var buttonSlider = new widgets.PushButton();
    buttonSlider.setText("Slider");
    buttonSlider.setFontSize(40);

    var buttonSpinner = new widgets.PushButton();
    buttonSpinner.setText("Spinner");
    buttonSpinner.setFontSize(40);

    var buttonLabel = new widgets.PushButton();
    buttonLabel.setText("Label");
    buttonLabel.setFontSize(40);

    var buttonLV = new widgets.PushButton();
    buttonLV.setText("List View");
    buttonLV.setFontSize(40);

    var buttonImage = new widgets.PushButton();     
    buttonImage.setText("Image");               
    buttonImage.setFontSize(40);                    

    var buttonExit = new widgets.PushButton();     
    buttonExit.setText("Exit");               
    buttonExit.setFontSize(40);                    
              
    stage.setRoot(groupRoot);
    var vPanel = new widgets.VerticalPanel();
    vPanel.setTy(120);
    vPanel.add(buttonPB);
    vPanel.add(buttonSlider);
    vPanel.add(buttonSpinner);
    vPanel.add(buttonLabel);
    vPanel.add(buttonLV);
    vPanel.add(buttonImage);
    vPanel.add(buttonExit);
    groupMain.add(labelTitle);
    groupRoot.add(groupBackground)
    groupMain.add(vPanel);
    groupRoot.add(groupMain)

    

// pushbutton
    var groupPB = new amino.ProtoGroup();
    groupPB.setTx(getWW());
    var exitPBPage= new widgets.PushButton();
    exitPBPage.setTx(getWW()-200).setW(200);
    exitPBPage.setText("Exit");
    exitPBPage.setFontSize(40);
    exitPBPage.setFill("DD0000");

    var vPanelPBPage = new widgets.VerticalPanel();
    var buttonPBPage= new widgets.PushButton();
    buttonPBPage.setText("Push");
    buttonPBPage.setTx(0);
    //buttonPBPage.setTx(getWW()/2-100);
    //buttonPBPage.setTy(getWH()/2-100);
    //buttonPBPage.setW(200);
    //buttonPBPage.setH(160);   
    buttonPBPage.setFontSize(40);
    vPanelPBPage.add(buttonPBPage);

    groupPB.add(vPanelPBPage);
    groupPB.add(exitPBPage);
    groupRoot.add(groupPB);
    
// slider
    var groupSlider = new amino.ProtoGroup();
    groupSlider.setTx(getWW());
    var exitSliderPage= new widgets.PushButton();
    exitSliderPage.setTx(getWW()-200).setW(200);
    exitSliderPage.setText("Exit");
    exitSliderPage.setFontSize(40);
    exitSliderPage.setFill("DD0000");

    var sliderSliderPage= new widgets.Slider();
    sliderSliderPage.setTx(getWW()/2-100);
    sliderSliderPage.setTy(getWH()/2-100);
    sliderSliderPage.setMax(80);
    sliderSliderPage.setFill("DD000000");
    groupSlider.add(sliderSliderPage);
    groupSlider.add(exitSliderPage);
    groupRoot.add(groupSlider);

//spinner
    var groupSpinner = new amino.ProtoGroup();
    groupSpinner.setTx(getWW());
    var exitSpinnerPage= new widgets.PushButton();
    exitSpinnerPage.setTx(getWW()-200).setW(200);
    exitSpinnerPage.setText("Exit");
    exitSpinnerPage.setFontSize(40);
    exitSpinnerPage.setFill("DD0000");

    var spinnerSpinnerPage= new widgets.ProgressSpinner();
    spinnerSpinnerPage.setTx(getWW()/2-100);
    spinnerSpinnerPage.setTy(getWH()/2-100);
    spinnerSpinnerPage.setActive(true);
//    spinnerSpinnerPage.setSize(200);
    spinnerSpinnerPage.setFontSize(40);
    groupSpinner.add(spinnerSpinnerPage);
    groupSpinner.add(exitSpinnerPage);
    groupRoot.add(groupSpinner);

// label
    var groupLabel = new amino.ProtoGroup();
    groupLabel.setTx(getWW());
    var exitLabelPage= new widgets.PushButton();
    exitLabelPage.setTx(getWW()-200).setW(200);
    exitLabelPage.setText("Exit");
    exitLabelPage.setFontSize(40);
    exitLabelPage.setFill("DD0000");

    var labelLabelPage= new widgets.Label();
    labelLabelPage.setText("Label");
    labelLabelPage.setTx(getWW()/2-100);
    labelLabelPage.setTy(getWH()/2-100);
    //buttonPBPage.setW(200);
    //buttonPBPage.setH(160);   
    labelLabelPage.setFontSize(40);

    groupLabel.add(labelLabelPage);
    groupLabel.add(exitLabelPage);
    groupRoot.add(groupLabel);

// list view
    var groupLV = new amino.ProtoGroup();
    groupLV.setTx(getWW());
    var exitLVPage= new widgets.PushButton();
    exitLVPage.setTx(getWW()-200).setW(200);
    exitLVPage.setText("Exit");
    exitLVPage.setFontSize(40);
    exitLVPage.setFill("DD0000");
    var listviewLVPage = new widgets.ListView();
    //listviewLVPage.setCellHeight(80);
//    listviewLVPage.setTextCellRenderer(function(cell,i,item) {
//        cell.setFontSize(30);
//    });

    //groupLabel.add(labelLabelPage);
    groupLV.add(exitLVPage);
    groupLV.add(listviewLVPage);   
    groupRoot.add(groupLV);


// image
   var groupImage = new amino.ProtoGroup();
   groupImage.setTx(getWW());                               
    var exitImagePage= new widgets.PushButton();             
    exitImagePage.setTx(getWW()-200).setW(200);
    exitImagePage.setText("Exit");                           
    exitImagePage.setFontSize(40);                           
    exitImagePage.setFill("DD0000");      

    //var imagew2;                                        
    //var imageh2;                                            
    //if(ww < wh) {               
    //   imagew2 = 1920 * wh/1280;        
    //   imageh2 = wh;            
    //} else {                                              
    //   imagew2 = ww;                                                                                
    //   imageh2 = 1280 * ww/1920;                            
    //}                                         

    var imageImagePage = new amino.ProtoImageView(); 
    //imageImagePage.setSrc("/system/examples/nexus/qml/lockscreen/judge_paper_by_apofiss-d4khezi.jpg");
    imageImagePage.setSrc("/data/beach_sunset.jpg");
    //var imageImagePageXAdj=(ww-imagew2)/2.0;
    //var imageImagePageYAdj=(wh-imageh2)/2.0;
    //imageImagePage.setTx(GetWW()).setTy((wh-imageh2)/2.0).setW(imagew2).setH(imageh2);                      

    imageImagePage.setW(getWW()).setH(getWH());

    groupImage.add(imageImagePage);                                
    groupImage.add(exitImagePage);                                    

    groupRoot.add(groupImage);                                     


    core.on("action",buttonPB, function() {
        //create an animation
        // tx goes from 0 to 400 over 600ms. do it once (1). no auto reverse
        //var anim = core.createPropAnim(rect,"tx",0, 400, 600);
	var anim1 = core.createPropAnim(groupMain,"tx",0, -getWW(), getSlideSpeed());
	var anim2 = core.createPropAnim(groupPB,"tx",getWW(), 0, getSlideSpeed());
    });

    core.on("action",exitPBPage, function() {
        //create an animation
        // tx goes from 0 to 400 over 600ms. do it once (1). no auto reverse
        //var anim = core.createPropAnim(rect,"tx",0, 400, 600);
	var anim1 = core.createPropAnim(groupMain,"tx",-getWW(),0, getSlideSpeed());
	var anim2 = core.createPropAnim(groupPB,"tx",0,getWW(),  getSlideSpeed());
	exitPBPage.setFill("DD0000");
    });


    core.on("action",buttonPBPage, function() {
	console.log('buttonPBPage pushed');
        //create an animation
        // tx goes from 0 to 400 over 600ms. do it once (1). no auto reverse
        //var anim = core.createPropAnim(rect,"tx",0, 400, 600);
	var anim1 = core.createPropAnim(vPanelPBPage,"ty",0, getWH()-100,getSlideSpeed());

    });

    core.on("action",buttonSlider, function() {
        //create an animation
        // tx goes from 0 to 400 over 600ms. do it once (1). no auto reverse
        //var anim = core.createPropAnim(rect,"tx",0, 400, 600);
	var anim1 = core.createPropAnim(groupMain,"tx",0, -getWW(), getSlideSpeed());
	var anim2 = core.createPropAnim(groupSlider,"tx",getWW(), 0, getSlideSpeed());
    });

    core.on("action",exitSliderPage, function() {
        //create an animation
        // tx goes from 0 to 400 over 600ms. do it once (1). no auto reverse
        //var anim = core.createPropAnim(rect,"tx",0, 400, 600);
	var anim1 = core.createPropAnim(groupMain,"tx",-getWW(),0, getSlideSpeed());
	var anim2 = core.createPropAnim(groupSlider,"tx",0,getWW(),  getSlideSpeed());
	exitSliderPage.setFill("DD0000");
    });


    core.on("action",buttonSpinner, function() {
        //create an animation
        // tx goes from 0 to 400 over 600ms. do it once (1). no auto reverse
        //var anim = core.createPropAnim(rect,"tx",0, 400, 600);
	var anim1 = core.createPropAnim(groupMain,"tx",0, -getWW(), getSlideSpeed());
	var anim2 = core.createPropAnim(groupSpinner,"tx",getWW(), 0, getSlideSpeed());
    });

    core.on("action",exitSpinnerPage, function() {
        //create an animation
        // tx goes from 0 to 400 over 600ms. do it once (1). no auto reverse
        //var anim = core.createPropAnim(rect,"tx",0, 400, 600);
	var anim1 = core.createPropAnim(groupMain,"tx",-getWW(),0, getSlideSpeed());
	var anim2 = core.createPropAnim(groupSpinner,"tx",0,getWW(),  getSlideSpeed());
	exitSpinnerPage.setFill("DD0000");
    });

    core.on("action",buttonLabel, function() {
        //create an animation
        // tx goes from 0 to 400 over 600ms. do it once (1). no auto reverse
        //var anim = core.createPropAnim(rect,"tx",0, 400, 600);
	var anim1 = core.createPropAnim(groupMain,"tx",0, -getWW(), getSlideSpeed());
	var anim2 = core.createPropAnim(groupLabel,"tx",getWW(), 0, getSlideSpeed());
    });

    core.on("action",exitLabelPage, function() {
        //create an animation
        // tx goes from 0 to 400 over 600ms. do it once (1). no auto reverse
        //var anim = core.createPropAnim(rect,"tx",0, 400, 600);
	var anim1 = core.createPropAnim(groupMain,"tx",-getWW(),0, getSlideSpeed());
	var anim2 = core.createPropAnim(groupLabel,"tx",0,getWW(),  getSlideSpeed());
	exitLabelPage.setFill("DD0000");
    });

    core.on("action",buttonLV, function() {
        //create an animation
        // tx goes from 0 to 400 over 600ms. do it once (1). no auto reverse
        //var anim = core.createPropAnim(rect,"tx",0, 400, 600);
	var anim1 = core.createPropAnim(groupMain,"tx",0, -getWW(), getSlideSpeed());
	var anim2 = core.createPropAnim(groupLV,"tx",getWW(), 0, getSlideSpeed());
    });

    core.on("action",exitLVPage, function() {
        //create an animation
        // tx goes from 0 to 400 over 600ms. do it once (1). no auto reverse
        //var anim = core.createPropAnim(rect,"tx",0, 400, 600);
	var anim1 = core.createPropAnim(groupMain,"tx",-getWW(),0, getSlideSpeed());
	var anim2 = core.createPropAnim(groupLV,"tx",0,getWW(),  getSlideSpeed());
	exitLVPage.setFill("DD0000");
    });

    core.on("action",buttonImage, function() {                                                         
        //create an animation                                                                       
        // tx goes from 0 to 400 over 600ms. do it once (1). no auto reverse                        
        //var anim = core.createPropAnim(rect,"tx",0, 400, 600);                          
        var anim1 = core.createPropAnim(groupMain,"tx",0, -getWW(), getSlideSpeed());     
        var anim3 = core.createPropAnim(groupBackground,"tx",0, -getWW(), getSlideSpeed());     
        var anim2 = core.createPropAnim(groupImage,"tx",getWW(), 0, getSlideSpeed());        

    });                                                                                             
                                                                                                    
    core.on("action",exitImagePage, function() {                                                       
        //create an animation                                                                       
        // tx goes from 0 to 400 over 600ms. do it once (1). no auto reverse                        
        //var anim = core.createPropAnim(rect,"tx",0, 400, 600);                          
        var anim1 = core.createPropAnim(groupMain,"tx",-getWW(),0, getSlideSpeed());      
        var anim3 = core.createPropAnim(groupBackground,"tx",-getWW(),0, getSlideSpeed());      
        var anim2 = core.createPropAnim(groupImage,"tx",0,getWW(),  getSlideSpeed());        
        exitImagePage.setFill("DD0000");                                                               
    });                          


    core.on("action", buttonExit, function() { 
        process.exit(0);                   
    });

});
