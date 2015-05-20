QUnit.test("Pulse returning types", function(assert) {
    assert.ok(function() {
        var pulse = new Pulse();
        return pulse.loadBufferFromURI("assets/song.mp3");
    }, 'Web Audio API is supported');
});

QUnit.test("Pulse", function(assert) {
    var done = assert.async();

    var pulse = new Pulse();
    pulse.onComplete = function(event, pulse) {
        console.log(typeof pulse.renderedBuffer);
        assert.equal(typeof pulse.renderedBuffer, '', '');

        var extrapolatedPeaks = pulse.getExtrapolatedPeaks(
            pulse.renderedBuffer,
            pulse.significantPeaks,
            pulse.beat
        );
        done();
    };
    pulse.loadBufferFromURI("assets/song.mp3");
});

/*var pulse = new Pulse({
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
*/