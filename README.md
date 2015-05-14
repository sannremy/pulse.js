Pulse.js
========

This library aims to get the BPM (beat per minute) automatically with Web Audio API.

Usage
-----

Here is a basic usage of Pulse:

    var uri = "song.mp3";
    var pulse = new Pulse({
      
        // when Pulse has finished to compute main data: beat, significant peaks...
        onComplete: function(event, pulse) {
            var extrapolatedPeaks = pulse.getExtrapolatedPeaks(
                pulse.renderedBuffer,
                pulse.significantPeaks,
                pulse.beat
            );

            // beat (ms and bpm properties)
            console.log(pulse.beat);

            // extrapolated peaks
            console.log(extrapolatedPeaks);
        }
    });

    pulse.loadBufferFromURI(uri);

Example
-------

This is a screenshot of a game based on rhythms like ["Dance Dance Revolution"](http://en.wikipedia.org/wiki/Dance_Dance_Revolution). It show one of the several possibilities of Pulse.

![Image]
(http://i.imgur.com/nKaGrWm.png)

Documentation
-------------

The [full documentation](https://github.com/srchea/pulse.js/blob/master/doc/README.md) can be found on this repository.

Contributions
-------------

 * Install all grunt tasks: `npm install`
 * Then run: `grunt watch`
 * Enjoy :-) and please do not forget comments.

Of course, all contributions are welcome.


References
----------

 * [Beat Detection Using JavaScript and the Web Audio API](http://tech.beatport.com/2014/web-audio/beat-detection-using-web-audio/)
 * [Calculating BPM using Javascript and the Spotify Web API](http://jmperezperez.com/beats-audio-api/)
