var pulse = new Pulse();
pulse.loadBufferFromURI("assets/song.mp3", {
    onsuccess: function(pulse) {
        pulse.process();
    },
    onerror: function(request) {
        console.log(request.status);
    },
});
