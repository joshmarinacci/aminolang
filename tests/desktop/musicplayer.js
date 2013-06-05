var fs = require('fs');
var lame = require('lame');
var Speaker = require('speaker');

var lib = {
    albums: [
        {
            name:"Yellow Submarine",
            artist: "The Beatles",
            artwork: "tests/images/beatles_03.jpg",
            tracks: [
                {
                    title: "Yellow Submarine",
                    file: "The Beatles/Yellow Submarine/01 Yellow Submarine.mp3"
                },
                {
                    title: "Hey Bulldog",
                    file: "The Beatles/Yellow Submarine/04 Hey Bulldog.mp3"
                },
                {
                    title: "All Together Now",
                    file: "The Beatles/Yellow Submarine/03 All Together Now.mp3"
                },
                {
                    title: "Sea Of Time",
                    file: "The Beatles/Yellow Submarine/08 Sea Of Time.mp3"
                }
            ]
        },
        {
            name:"Abbey Road",
            artist: "The Beatles",
            artwork: "tests/images/beatles_01.jpg",
            tracks: [
                {
                    title:"Come Together",
                    file: "The Beatles/Abbey Road/01 Come Together.mp3"
                },
                {
                    title: "Something",
                    file: "The Beatles/Abbey Road/02 Something.mp3"
                },
                {
                    title: "Maxwell's Silver Hammer",
                    file: "The Beatles/Abbey Road/03 Maxwell's Silver Hammer.mp3"
                }
            ]
        },
        {
            name:"For Sale",
            artist: "The Beatles",
            artwork: "tests/images/beatles_02.jpg",
            tracks: [
                {
                    title:"No Reply",
                    file: "The Beatles/Beatles For Sale/01 No Reply.mp3"
                },
                {
                    title: "I'm A Loser",
                    file: "The Beatles/Beatles For Sale/02 I'm A Loser.mp3"
                },
                {
                    title: "Baby's In Black",
                    file: "The Beatles/Beatles For Sale/03 Baby's In Black.mp3"
                }
            ]
        },
        {
            name:"Night Train",
            artist: "Keane",
            artwork: "tests/images/keane_01.jpg",
            tracks: [
                {
                    title:"House Lights",
                    file: "Keane/Night Train/01 House Lights.mp3"
                },
                {
                    title: "Back In Time",
                    file: "Keane/Night Train/02 Back In Time.mp3"
                },
                {
                    title: "Stop For A Minute",
                    file: "Keane/Night Train/03 Stop For A Minute.mp3"
                }
            ]
        },
        {
            name:"Perfect Symmetry",
            artist: "Keane",
            artwork: "tests/images/keane_02.jpg",
            tracks: [
                {
                    title:"Spiralling",
                    file: "Keane/Perfect Symmetry/01 Spiralling.mp3"
                },
                {
                    title: "The Lovers Are Losing",
                    file: "Keane/Perfect Symmetry/02 The Lovers Are Losing.mp3"
                },
                {
                    title: "Better Than This",
                    file: "Keane/Perfect Symmetry/03 Better Than This.mp3"
                }
            ]
        }
    ]
}
        
var BASE = "/Volumes/PieHole/Mp3Archive/iTunes/";
function setup(nav,stage) {        
    var currentAlbum = lib.albums[0];
    var currentTrack = 0;
    
    var title = stage.find("musicTitle");
    function prevTrack() {
        currentTrack--;
        if(currentTrack < 0) currentTrack = 0;
        title.setText(currentAlbum.tracks[currentTrack].title);
    }
    stage.on("ACTION",stage.find("prevButton"),prevTrack);
    function nextTrack() {
        currentTrack++;
        if(currentTrack > currentAlbum.tracks.length-1) {
            currentTrack = 0;
        }
        var track = currentAlbum.tracks[currentTrack];
        if(playing) {
            playTrack(track);
        }
        title.setText(currentAlbum.tracks[currentTrack].title);
    }
    stage.on("ACTION",stage.find("nextButton"),nextTrack);
    
    var playing = false;
    var speaker;
    function playTrack(track) {
        if(playing) {
            stopTrack();
        }
        if(track.file) {
            playing = true;
            var file = BASE+track.file;
            console.log("checking file: " + file);
            fs.exists(file,function(exists) {
                console.log(file + ' exists = ',exists);
                if(exists) {
                    console.log("playing " + file);
                    speaker = new Speaker;
                    fs.createReadStream(file)
                      .pipe(new lame.Decoder)
                      .on('format', console.log)
                      .on('readable',console.log)
                      .on('end',console.log)
                      .on('error',console.log)
                      .on('close',console.log)
                      .pipe(speaker);
                }
            });
        } else {
            console.log("WARNING. Can't play a track with no file: " + track.title);
        }
    }
    function stopTrack() {
        if(playing) {
            console.log("stopping playing");
            speaker.end();
            playing = false;
        }
    }
    function playCurrentTrack() {
        if(playing) {
            stopTrack();
        } else {
            playTrack(currentAlbum.tracks[currentTrack]);
        }
    }
    stage.on("ACTION",stage.find("playButton"),playCurrentTrack);
    
    
    var artwork = stage.find("musicArtwork");
    artwork.sw = 75;
    artwork.sh = 75;
    function setAlbum(album) {
        currentAlbum = album;
        currentTrack = 0;
        var url = currentAlbum.artwork;
        console.log(url);
        artwork.setUrl(url);
        title.setText(currentAlbum.tracks[currentTrack].title);
    }
    setAlbum(lib.albums[0]);
    
    var popup = stage.find("musicPopup");
    var widget = stage.find("musicWidget");
    nav.createTransition("showMusicPopup",widget,popup,"popup");
    
    var albumList = stage.find("albumList");
    albumList.listModel = lib.albums;
    albumList.cellRenderer = function(gfx, info, bounds) {
        var color = "#ccffff";
        if(info.list.selectedIndex == info.index) {
            color = "#33aaff";
        }
        gfx.fillQuadColor(color, bounds);
        
        gfx.fillQuadText("#000000",
            info.item.name,
            bounds.x+5, bounds.y, info.list.getFontSize(), info.list.font.fontid);
    };
    stage.on("SELECT",albumList, function(e) {
        var n = e.index;
        console.log("selected index: " + n);
        setAlbum(lib.albums[n]);
    });
    stage.on("ACTION",stage.find("musicOpenButton"), function() {
            nav.push("showMusicPopup");
    });
    stage.on("ACTION",stage.find("musicCloseButton"), function() {
            nav.pop();
    });

}

exports.setup = setup;
