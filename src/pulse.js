(function(global) {

    "use strict";

    var Pulse = function() {
        this.audioContext = this.getAudioContext();
    };

    Pulse.prototype.getAudioContext = function() {
        try {
            global.AudioContext = global.AudioContext || global.webkitAudioContext;
            return new global.AudioContext();
        } catch(e) {
            alert("Web Audio API is not supported in this browser.");
            return null;
        }
    };

    Pulse.prototype.loadURI = function(uri) {
        var self = this,
            request = new XMLHttpRequest();

        request.open("GET", uri, true);
        request.responseType = "arraybuffer";

        request.addEventListener("load", function() {
            self.audioContext.decodeAudioData(
                this.response,
                self.processBpm,
                function(error) {
                    alert("Decoding error:" + error);
                }
            );
        }, false);

        request.send();
    };

    /*
    Pulse.prototype.processBpm = function(buffer) {
        if(!global.fingr.checkAudioBuffer(buffer)) {
            global.alert("Nope...");
            return false;
        }

        var self = this;

        var offlineContext = new global.OfflineAudioContext(1, buffer.length, buffer.sampleRate);

        var source = offlineContext.createBufferSource();
        source.buffer = buffer;

        var filter = offlineContext.createBiquadFilter();
        filter.type = "lowpass";

        source.connect(filter);
        filter.connect(offlineContext.destination);

        source.start(0);
        offlineContext.startRendering();

        var playbackTempo = [];

        offlineContext.oncomplete = function(e) {
            var filteredBuffer = e.renderedBuffer;

            var data = filteredBuffer.getChannelData(0);
            var length = data.length;

            var min = data[0], max = data[0];
            for(var j = 1; j < length; j++) {
                min = Math.min(min, data[j]);
                max = Math.max(max, data[j]);
            }

            var intervalMin = 230; // ms, max tempo = 260 bpm

            var amplitude = Math.abs(min) + Math.abs(max);
            var maxThreshold = min + amplitude * 0.9; // 90% uppest beats
            var threshold = maxThreshold;
            var minThreshold = min + amplitude * 0.3; // 30% uppest beats

            var acuracy = filteredBuffer.sampleRate * (intervalMin / 1000);
            var peakFilter = [];
            var hiBeats = [];

            // grab peaks
            while (threshold >= minThreshold && peakFilter.length <= parseInt(buffer.duration, 10)) {
                j = 0;
                for(; j < length; j++) {
                    if (data[j] > threshold) {
                        peakFilter.push(j);

                        j += acuracy;
                    }
                }
                threshold -= 0.05; // -5% every interation
            }

            // sort peaks desc
            peakFilter.sort(function(a, b) {
                return a - b;
            });

            // convert from hz to to milliseconds
            for (var i in peakFilter) {
                peakFilter[i] = Math.floor((peakFilter[i] / filteredBuffer.sampleRate) * 1000);
            }

            // remove all duplicates and 0 values
            peakFilter = peakFilter.filter(function(item, pos) {
                return (!pos || item  > peakFilter[pos - 1]) && item > 0;
            });

            // count interval durations between each peak
            var intervals = {};
            for (var i = 1; i < peakFilter.length; i++) {
                for (var j = 0; j < i; j++) {

                    // assuming intervals must be less than 260 bpm (more than ~230 ms)
                    if (peakFilter[i] - peakFilter[j] >= 230) {
                        if (intervals[peakFilter[i] - peakFilter[j]] === undefined) {
                            intervals[peakFilter[i] - peakFilter[j]] = 0;
                        }
                        intervals[peakFilter[i] - peakFilter[j]]++;
                    }
                }
            }

            // quadratic mean to compute the average power
            var square = 0;
            var count = 0;
            for (var i in intervals) {
                square += Math.pow(intervals[i], 2);
                count++;
            }

            var avgCountInterval = Math.sqrt(square / count);

            // get max beats between an interval (1000 ms)
            var max = 0
            var ms = 0;
            var msBetween = [];
            var k;
            for (var i in intervals) {
                if (intervals[i] > avgCountInterval) {
                    if (intervals[i] > max) {
                        max = intervals[i];
                        ms = parseInt(i, 10);
                    }

                    k = Math.floor(i / 500); // segmentation by 500, this needs to be computed
                    if (msBetween[k] === undefined) {
                        msBetween.push({ max: 0, ms: parseInt(i, 10) });
                    }

                    if (msBetween[k] !== undefined && intervals[i] > msBetween[k].max) {
                        msBetween[k] = { max: intervals[i], ms: parseInt(i, 10) };
                    }
                }
            }

            // compare ms with all other time beats
            var referenceMs = msBetween.slice(0, 3);
            var sumMargins = [];
            
            for (var i = 0; i < referenceMs.length; i++) {
                sumMargins.push(0);
                for (var j in msBetween) {
                    sumMargins[i] += msBetween[j].ms % referenceMs[i].ms;
                }
            }

            var minMarginIndex = 0;
            var minMargin = sumMargins[minMarginIndex];
            for (var i = 1; i < sumMargins.length; i++) {
                if (minMargin > sumMargins[i]) {
                    minMargin = sumMargins[i];
                    minMarginIndex = i;
                }
            }

            console.log("ms = " + referenceMs[minMarginIndex].ms);
            console.log("tempo = " + 60000 / referenceMs[minMarginIndex].ms);

            // find the start beat of tempo
            var tempo = Math.round(60000 / referenceMs[minMarginIndex].ms);
            var tempoMs = referenceMs[minMarginIndex].ms;

            document.getElementById("pulse").style.webkitAnimationDuration = tempoMs + "ms";
            document.getElementById("pulse").innerHTML = tempo;

            for (var i = 0; i < peakFilter.length; i++) {
                for (var j = 0; j < i; j++) {
                    if(peakFilter[i] - peakFilter[j] == tempoMs) {
                       playbackTempo.push(peakFilter[i]);
                       playbackTempo.push(peakFilter[j]);
                    }
                }
            }

            playbackTempo.sort(function(a, b) {
                return a - b;
            });

            playbackTempo = playbackTempo.filter(function(item, pos) {
                return (!pos || item > playbackTempo[pos - 1] + 230) && item > 0;
            });

            // detect chained
            var chainedKeys = [];
            var chainedKeysMax = [];
            var errorMs = 2;
            for (var i = 0; i < playbackTempo.length - 1; i++) {
                if (playbackTempo[i] + tempoMs <= playbackTempo[i + 1] + errorMs && playbackTempo[i] + tempoMs >= playbackTempo[i + 1] - errorMs) {
                    chainedKeys.push(i);
                } else {
                    if (chainedKeysMax.length < chainedKeys.length) {
                        chainedKeysMax = chainedKeys;
                    }

                    chainedKeys = [];
                }
            }

            var simulatedBeats = [];

            //console.log(playbackTempo);
            //console.log(chainedKeysMax);
            //console.log(peakFilter);

            if (chainedKeysMax.length) {
                var minChained = playbackTempo[chainedKeysMax[0]];
                while (minChained > tempoMs) {
                    minChained -= tempoMs;
                }

                var maxChained = playbackTempo[chainedKeysMax.length - 1];
                while (maxChained < buffer.duration * 1000) {
                    maxChained += tempoMs;
                }

                for (var i = minChained; i <= maxChained; i += tempoMs) {
                    simulatedBeats.push(i);
                };
            }

            // to sec
            for (var i = 0; i < simulatedBeats.length; i++) {
                simulatedBeats[i] -= global.fingr.msMoveDown;
                simulatedBeats[i] /= 1000;
            }

            // to sec
            for (var i = 0; i < peakFilter.length; i++) {
                peakFilter[i] -= global.fingr.msMoveDown;
                peakFilter[i] /= 1000;
            }

            console.log(peakFilter);
            console.log(simulatedBeats);

            global.fingr.beatPerMS = tempoMs;

            global.fingr.dance(buffer, peakFilter, simulatedBeats);
        };
    };
    */

}(window));