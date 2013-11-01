var amino = require('../../build/desktop/amino.js');
var widgets = require('../../build/desktop/widgets.js');

exports.SongListViewCell = amino.ComposeObject({
    type:"SongListViewCell",
    extend: amino.ProtoWidget,
    comps: {
        background: {
            proto: amino.ProtoRect,
            promote: ['w','h','fill'],
        },
        title: {
            proto: amino.ProtoText,
        },
        artist: {
            proto: amino.ProtoText,
        },
        album: {
            proto: amino.ProtoText,
        },
        play: {
            proto: widgets.PushButton,
        },
    },
    init: function() {
        this.comps.base.add(this.comps.background);
        this.comps.base.add(this.comps.title);
        this.comps.base.add(this.comps.artist);
        this.comps.base.add(this.comps.album);
        this.comps.base.add(this.comps.play);
        this.comps.title.setTx(0).setTy(20).setFontSize(15);
        this.comps.artist.setTx(100).setTy(20).setFontSize(15);
        this.comps.album.setTx(200).setTy(20).setFontSize(15);
        this.comps.play.setTx(300).setTy(5).setW(40).setH(20).setText("play");
    },
});


exports.MusicViewCustomizer = function(view,folder) {
    var lv = new widgets.ListView().setFill("#ffffff");
    view.comps.contents.add(lv);
    lv.setModel(folder.getItems());
    lv.setCellGenerator(function() { return new exports.SongListViewCell(); });
    lv.setTextCellRenderer(function(cell,index,item) {
        if(item == null) return;
        cell.comps.title.setText(item.doc.title);
        cell.comps.artist.setText(item.doc.artist);
        cell.comps.album.setText(item.doc.album);
    });
    if(folder.onUpdate) {
        folder.onUpdate(function(doc) {
            lv.setModel(folder.getItems());
        });
    }


    view.comps.toolbar
        .add(
            new widgets.PushButton().setW(30).setH(20).setFontSize(20).setFontName('awesome')
            .setText('\uf04a').onAction(function(e) {
            }))
        .add(
            new widgets.PushButton().setW(30).setH(20).setFontSize(20).setFontName('awesome')
            .setText('\uf04b').onAction(function(e) {
            }))
        .add(
            new widgets.PushButton().setW(30).setH(20).setFontSize(20).setFontName('awesome')
            .setText('\uf04e').onAction(function(e) {
            }))
        ;
    view.comps.toolbar.redoLayout();
}

