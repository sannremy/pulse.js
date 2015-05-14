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

pulse.loadBufferFromURI("assets/song.mp3");
