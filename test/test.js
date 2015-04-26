var pulse = new Pulse();
pulse.loadBufferFromURI("assets/song.mp3", {
    onsuccess: function(pulse) {
        console.log(pulse.buffer);
    },
    onerror: function(request) {
        console.log(request.status);
    },
});
