Pulse.js
========

Beats per minute (BPM) automatic detection with Web Audio API.

Examples
--------



Usage
-----

var pulse = new Pulse({
    onComplete: function(event, pulse) {
        var extrapolatedPeaks = pulse.getExtrapolatedPeaks(
            pulse.renderedBuffer,
            pulse.significantPeaks,
            pulse.beat
        );

        console.log(extrapolatedPeaks);
    }
});

pulse.loadBufferFromURI("assets/song.mp3");

Documentation
-------------

https://github.com/srchea/pulse.js/blob/master/doc/README.md


References
----------

http://tech.beatport.com/2014/web-audio/beat-detection-using-web-audio/
http://jmperezperez.com/beats-audio-api/
