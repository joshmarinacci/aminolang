process.on('message',function(m) {
    console.log('child got',m);
    process.send({
        command:'redraw',
        id:'zip',
    })
});
