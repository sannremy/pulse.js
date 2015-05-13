var pulse = new Pulse({
    onComplete: function(event, pulse) {
        var extrapolatedPeaks = pulse.getExtrapolatedPeaks(
            pulse.renderedBuffer,
            pulse.significantPeaks,
            pulse.beat
        );

        console.log(pulse.beat);
    },
    onRequestProgress:function(pulse, request, requestEvent) {

    },
    onRequestSuccess: function(pulse, request, requestEvent) {
        //console.log(pulse);
    },
    onRequestAbort: function(pulse, request, requestEvent) {
        
    },
    onRequestError: function(pulse, request, requestEvent) {
        //console.log(request.status);
    },
    convertToMilliseconds: true,
    removeDuplicates: true,
});

//pulse.loadBufferFromURI("assets/393345-want-to-want-me.mp3");
pulse.loadBufferFromURI("assets/Ariana Grande One Last Time - 1425285634.mp3");
//pulse.loadBufferFromURI("assets/Hey Mama Feat Nicki Minaj Afrojack David Guetta - 1416722346.mp3");
//pulse.loadBufferFromURI("assets/I Really Like You- Carly Rae Jepsen - I Really Like You I Really Like You - I Really Like You Carly Jepsen.mp3");
//pulse.loadBufferFromURI("assets/song.mp3");
//pulse.loadBufferFromURI("assets/Sugar Maroon 5 - 1424923583.mp3");
//pulse.loadBufferFromURI("assets/Thinking Out Loud - Thinking Out Loud Ed Sheeran - Thinking Out Loud - Ed Sheeran.mp3");
//pulse.loadBufferFromURI("assets/Uptown Funk (feat. Bruno Mars) - Mark Ronson.mp3");
pulse.loadBufferFromURI("assets/Sugar Maroon 5 - 1424923583.mp3");
