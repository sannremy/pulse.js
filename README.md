Pulse.js
========

This library aims to get the BPM (beat per minute) automatically with Web Audio API.

Installation
------------

To install Pulse.js with bower: `bower install pulsejs`

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

Examples
--------

This is a screenshot of a game based on rhythms like ["Dance Dance Revolution"](http://en.wikipedia.org/wiki/Dance_Dance_Revolution). It show one of the several possibilities of Pulse.

<p>
<figure>
    <a href="http://i.imgur.com/nKaGrWm.png">
       <img src="http://i.imgur.com/nKaGrWm.png" width="395">
    </a>
<br /><figcaption>Mark Ronson - Uptown Funk feat. Bruno Mars</figcaption>
</figure>
</p>

<p>
<figure>
    <a href="http://i.imgur.com/X98o1qj.png">
       <img src="http://i.imgur.com/X98o1qj.png" width="395">
    </a>
<br /><figcaption>Avicii - The Nights</figcaption>
</figure>
</p>

<p>
<figure>
    <a href="http://i.imgur.com/BXuispo.png">
       <img src="http://i.imgur.com/BXuispo.png" width="395">
    </a>
<br /><figcaption>Avicii - The Nights</figcaption>
</figure>
</p>

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
