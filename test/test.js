var pulse = new Pulse({
    onsuccess: function(pulse) {
        pulse.process();
    },
    onerror: function(request) {
        console.log(request.status);
    }
});

pulse.loadBufferFromURI("assets/song.mp3");
