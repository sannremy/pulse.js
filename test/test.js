var pulse = new Pulse({
	onComplete: function(event, pulse) {
		var extrapolatedPeaks = pulse.getExtrapolatedPeaks(
			pulse.renderedBuffer,
			pulse.significantPeaks,
			pulse.beat
		);

		console.log(extrapolatedPeaks);
	},
    onRequestSuccess: function(pulse, request) {
    	//console.log(pulse);
    },
    onRequestError: function(pulse, request) {
        //console.log(request.status);
    },
    convertToMilliseconds: true,
    removeDuplicates: true,
});

pulse.loadBufferFromURI("assets/song.mp3");
