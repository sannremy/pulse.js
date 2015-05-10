(function(global) {

    "use strict";

    var self,

    /**
     * @global
     * @class Pulse
     * @description Beats per minute (BPM) automatic detection with Web Audio API.
     * @param {object} options Options available for Pulse
     * @param {function} options.onComplete Fired when Pulse has finished to compute main data: beat, significant peaks.
     * @param {function} options.onRequestProgress Fired when the XHR object is downloading data.
     * @param {function} options.onRequestSuccess Fired when the XHR object has successfully finished.
     * @param {function} options.onRequestAbort Fired when the XHR object has aborted.
     * @param {function} options.onRequestError Fired when the XHR object has an error occured.
     * @param {boolean} options.convertToMilliseconds [options.convertToMilliseconds=true]
     * @param {boolean} options.removeDuplicates [options.removeDuplicates=true]
     * @returns {void}
     */
     Pulse = function(options) {

        self = this;

        this.audioContext = this.getAudioContext();
        this.buffer = null;
        this.renderedBuffer = null;
        this.significantPeaks = null;
        this.beat = {
            ms: null,
            bpm: null
        };
        this.options = options || {};

        /**
         * @param {number} WEB_AUDIO_API_NOT_SUPPORTED [WEB_AUDIO_API_NOT_SUPPORTED=1001]
         * @param {number} REQUEST_PROGRESS [REQUEST_PROGRESS=101]
         * @param {number} REQUEST_LOAD [REQUEST_LOAD=102]
         * @param {number} REQUEST_ERROR [REQUEST_ERROR=1102]
         * @param {number} REQUEST_ABORT [REQUEST_ABORT=104]
         */
         this.WEB_AUDIO_API_NOT_SUPPORTED = 1001;
         this.REQUEST_PROGRESS = 101;
         this.REQUEST_LOAD = 102;
         this.REQUEST_ERROR = 1102;
         this.REQUEST_ABORT = 104;

         var notifier = Object.getNotifier(this),
         changeIndex;

         Object.defineProperty(this, 'status', {
            get: function() {
                return parseInt(status, 10);
            },
            set: function(s) {
                if (s == status) {
                    return;
                }

                notifier.notify({
                    type: 'update',
                    name: 'status',
                    oldValue: s
                });

                status = s;
            }
        });

         Object.defineProperty(this, 'options', {
            get: function() {
                return options;
            },
            set: function(o) {
                var defaultOptions = this.getDefaultOptions(),
                i;
                for(i in defaultOptions) {
                    if(o[i] === undefined) {
                        o[i] = defaultOptions[i];
                    }
                }

                options = o;
            }
        });

         Object.observe(this, function(changes) {
            for(changeIndex = 0; changeIndex < changes.length; changeIndex++) {
                if(
                    changes[changeIndex].type === 'update' &&
                    changes[changeIndex].name === 'status' &&
                    changes[changeIndex].lastValue != self.status
                    ) {
                    switch(self.status) {
                        case self.WEB_AUDIO_API_NOT_SUPPORTED :
                        console.error("WEB_AUDIO_API_NOT_SUPPORTED");
                        break;

                        case self.REQUEST_PROGRESS :
                        console.log("REQUEST_PROGRESS");
                        break;

                        case self.REQUEST_LOAD :
                        console.log("REQUEST_LOAD");
                        break;

                        case self.REQUEST_ERROR :
                        console.error("REQUEST_ERROR");
                        break;

                        case self.REQUEST_ABORT :
                        console.error("REQUEST_ABORT");
                        break;

                        default :
                        console.error("STATUS NOT IMPLEMENTED");
                        break;
                    }
                }
            }
        });
};

    /**
     * @memberof Pulse#
     * @method Pulse#getAudioContext
     * @description getAudioContext description
     * @returns {AudioContext|object} The audio context object or null if the browser is not supported Web Audio API.
     */
     Pulse.prototype.getAudioContext = function() {
        try {
            global.AudioContext = global.AudioContext || global.webkitAudioContext;
            return new global.AudioContext();
        } catch(e) {
            this.status = this.WEB_AUDIO_API_NOT_SUPPORTED;
            return null;
        }
    };

    /**
     * @memberof Pulse#
     * @method Pulse#getDefaultOptions
     * @description getDefaultOptions description
     * @returns {object} Options with default values
     */
     Pulse.prototype.getDefaultOptions = function() {
        return {
            onComplete: function() {},
            onRequestProgress: function() {},
            onRequestSuccess: function() {},
            onRequestAbort: function() {},
            onRequestError: function() {},
            convertToMilliseconds: true,
            removeDuplicates: true,
        };
    };

    /**
     * @memberof Pulse#
     * @method Pulse#loadBufferFromURI
     * @description loadBufferFromURI description
     * @param {string} uri
     * @returns {boolean} Options with default values
     */
     Pulse.prototype.loadBufferFromURI = function(uri) {

        if(this.audioContext === null) {
            return false;
        }

        var request = new XMLHttpRequest();

        request.open("GET", uri, true);
        request.responseType = "arraybuffer";

        request.addEventListener("progress", function(event) {
            self._requestProgress(event, this);
        }, false);

        request.addEventListener("load", function(event) {
            self._requestLoad(event, this);
        }, false);

        request.addEventListener("error", function() {
            self._requestError(event, this);
        }, false);

        request.addEventListener("abort", function() {
            self._requestAbort(event, this);
        }, false);

        request.send(null);

        return true;
    };

    /**
     * @memberof Pulse#
     * @method Pulse#_requestProgress
     * @access private
     * @description _requestProgress description
     * @param {RequestEvent} event The request event object
     * @param {XmlHttpRequest} request The XHR object
     * @returns {void}
     */
    Pulse.prototype._requestProgress = function(event, request) {
        this.status = this.REQUEST_PROGRESS;
        this.options.onRequestProgress(this, request, event);
    };

    /**
     * @memberof Pulse#
     * @method Pulse#_requestLoad
     * @access private
     * @description _requestLoad description
     * @param {RequestEvent} event The request event object
     * @param {XmlHttpRequest} request The XHR object
     * @returns {void}
     */
    Pulse.prototype._requestLoad = function(event, request) {
        if(request.readyState === request.DONE) {
            this.buffer = request.response;
            this.status = this.REQUEST_LOAD;
            this.options.onRequestSuccess(this, request, event);
            this.process();
        } else {
            this._requestError(event, request, this.options);
        }
    };

    /**
     * @memberof Pulse#
     * @method Pulse#_requestError
     * @access private
     * @description _requestError description
     * @param {RequestEvent} event The request event object
     * @param {XmlHttpRequest} request The XHR object
     * @returns {void}
     */
    Pulse.prototype._requestError = function(event, request) {
        this.status = this.REQUEST_ERROR;
        this.options.onRequestError(this, request, event);
    };

    /**
     * @memberof Pulse#
     * @method Pulse#_requestAbort
     * @access private
     * @description _requestAbort description
     * @param {RequestEvent} event The request event object
     * @param {XmlHttpRequest} request The XHR object
     * @returns {void}
     */
    Pulse.prototype._requestAbort = function(event, request) {
        this.status = this.REQUEST_ABORT;
        this.options.onRequestAbort(this, request, event);
    };

    /**
     * @memberof Pulse#
     * @method Pulse#process
     * @description Decode audio data
     * @return {void}
     */
    Pulse.prototype.process = function() {
        this.audioContext.decodeAudioData(
            this.buffer,
            this.processCallback,
            function(error) {
                self.status = self.DECODING_ERROR;
            }
        );
    };

    /**
     * @memberof Pulse#
     * @method Pulse#getOfflineContext
     * @description description
     * @return {OfflineAudioContext}
     */
    Pulse.prototype.getOfflineContext = function(buffer) {
        var offlineContext = new global.OfflineAudioContext(1, buffer.length, buffer.sampleRate),
        source = offlineContext.createBufferSource(),
        filter = offlineContext.createBiquadFilter();

        source.buffer = buffer;
        filter.type = "lowpass";

        source.connect(filter);
        filter.connect(offlineContext.destination);

        source.start(0);
        return offlineContext;
    };

    /**
     * @memberof Pulse#
     * @method Pulse#processCallback
     * @description description
     * @return {void}
     */
    Pulse.prototype.processCallback = function(buffer) {

        var offlineContext = self.getOfflineContext(buffer);

        offlineContext.oncomplete = function(event) {
            self.renderedBuffer = event.renderedBuffer;
            self.significantPeaks = self.getSignificantPeaks(event);
            self.beat = self.getBeat(self.significantPeaks);
            self.options.onComplete(event, self);
        };

        offlineContext.startRendering();
    };

    /**
     * @memberof Pulse#
     * @method Pulse#getChannelDataMinMax
     * @description description
     * @return {object}
     */
    Pulse.prototype.getChannelDataMinMax = function(channelData) {
        var length = channelData.length,
        min = channelData[0],
        max = channelData[0],
        j;

        for(j = 1; j < length; j++) {
            min = Math.min(min, channelData[j]);
            max = Math.max(max, channelData[j]);
        }

        return {
            min: min,
            max: max
        };
    };

    /**
     * @memberof Pulse#
     * @method Pulse#getSignificantPeaks
     * @description description
     * @return {object}
     */
    Pulse.prototype.getSignificantPeaks = function(event) {

        var channelData = this.renderedBuffer.getChannelData(0),
        limit = this.getChannelDataMinMax(channelData),
            intervalMin = 230, // ms, max tempo = 260 bpm
            amplitude = Math.abs(limit.min) + Math.abs(limit.max),
            maxThreshold = limit.min + amplitude * 0.9, // 90% uppest beats
            minThreshold = limit.min + amplitude * 0.3, // 30% uppest beats
            threshold = maxThreshold,
            acuracy = this.renderedBuffer.sampleRate * (intervalMin / 1000),
            significantPeaks = [],
            duration = parseInt(this.renderedBuffer.duration, 10),
            length = channelData.length,
            i,
            j;

        // grab peaks
        while (
            threshold >= minThreshold &&
            significantPeaks.length <= duration
            ) {
            j = 0;
        for(; j < length; j++) {
            if (channelData[j] > threshold) {
                significantPeaks.push(j);

                j += acuracy;
            }
        }
            threshold -= 0.05; // -5% every interation
        }

        significantPeaks.sort(function(a, b) {
            return a - b;
        });

        if(self.options.convertToMilliseconds) {
            for (i in significantPeaks) {
                significantPeaks[i] = Math.floor((significantPeaks[i] / this.renderedBuffer.sampleRate) * 1000);
            }
        }

        if(self.options.removeDuplicates) {
            // remove all duplicates and 0 values
            significantPeaks = significantPeaks.filter(function(item, pos) {
                return (!pos || item  > significantPeaks[pos - 1]) && item > 0;
            });
        }

        return significantPeaks;
    };

    /**
     * @memberof Pulse#
     * @method Pulse#getBeat
     * @description description
     * @return {object}
     */
    Pulse.prototype.getBeat = function(significantPeaks) {
        // count interval durations between each peak
        var intervals = {},
        square = 0,
        count = 0,
        max = 0,
        ms = 0,
        msBetween = [],
        k,
        i,
        j,
        avgCountInterval,
        referenceMs,
        sumMargins = [],
        minMarginIndex = 0,
        minMargin,
        tempo,
        tempoMs;

        for (i = 1; i < significantPeaks.length; i++) {
            for (j = 0; j < i; j++) {

                // assuming intervals must be less than 260 bpm (more than ~230 ms)
                if (significantPeaks[i] - significantPeaks[j] >= 230) {
                    if (intervals[significantPeaks[i] - significantPeaks[j]] === undefined) {
                        intervals[significantPeaks[i] - significantPeaks[j]] = 0;
                    }
                    intervals[significantPeaks[i] - significantPeaks[j]]++;
                }
            }
        }

        // quadratic mean to compute the average power
        for (i in intervals) {
            square += Math.pow(intervals[i], 2);
            count++;
        }

        avgCountInterval = Math.sqrt(square / count);

        // get max beats between an interval (1000 ms)
        for (i in intervals) {
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
        referenceMs = msBetween.slice(0, 3);
        for (i = 0; i < referenceMs.length; i++) {
            sumMargins.push(0);
            for (j in msBetween) {
                sumMargins[i] += msBetween[j].ms % referenceMs[i].ms;
            }
        }

        minMarginIndex = 0;
        minMargin = sumMargins[minMarginIndex];
        for (i = 1; i < sumMargins.length; i++) {
            if (minMargin > sumMargins[i]) {
                minMargin = sumMargins[i];
                minMarginIndex = i;
            }
        }

        // find the start beat of tempo
        tempo = Math.round(60000 / referenceMs[minMarginIndex].ms);
        tempoMs = referenceMs[minMarginIndex].ms;

        return {
            ms: tempoMs,
            bpm: tempo
        };
    };

    /**
     * @memberof Pulse#
     * @method Pulse#getExtrapolatedPeaks
     * @description description
     * @return {object}
     */
    Pulse.prototype.getExtrapolatedPeaks = function(renderedBuffer, significantPeaks, beat) {
        var playbackTempo = [],
        i,
        j,
        chainedKeys = [],
        chainedKeysMax = [],
        errorMs = 2,
        extrapolatedPeaks = [],
        minChained,
        maxChained;

        for (i = 0; i < significantPeaks.length; i++) {
            for (j = 0; j < i; j++) {
                if(significantPeaks[i] - significantPeaks[j] == beat.ms) {
                 playbackTempo.push(significantPeaks[i]);
                 playbackTempo.push(significantPeaks[j]);
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
        for (i = 0; i < playbackTempo.length - 1; i++) {
            if (playbackTempo[i] + beat.ms <= playbackTempo[i + 1] + errorMs && playbackTempo[i] + beat.ms >= playbackTempo[i + 1] - errorMs) {
                chainedKeys.push(i);
            } else {
                if (chainedKeysMax.length < chainedKeys.length) {
                    chainedKeysMax = chainedKeys;
                }

                chainedKeys = [];
            }
        }

        if (chainedKeysMax.length) {
            minChained = playbackTempo[chainedKeysMax[0]];
            while (minChained > beat.ms) {
                minChained -= beat.ms;
            }

            maxChained = playbackTempo[chainedKeysMax.length - 1];
            while (maxChained < renderedBuffer.duration * 1000) {
                maxChained += beat.ms;
            }

            for (i = minChained; i <= maxChained; i += beat.ms) {
                extrapolatedPeaks.push(i);
            }
        }

        return extrapolatedPeaks;
    };

    // bind to global
    global.Pulse = Pulse;

}(window));