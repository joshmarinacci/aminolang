process.on('message',function(m) {
    console.log('child got',m);
});
process.send({
    command:'make',
    target:'amino.ProtoRect',
    props: {
        fill:'#00FF00',
        w:100,
        h:100,
        tx:50,
        ty:100,
    }
});
