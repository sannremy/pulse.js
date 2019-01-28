(function(global) {

    "use strict";

    if(global.Pulse) {
        global.console.error("Pulse is already defined");
        return;
    }

    var self;

    /**
     * @global
     * @class Pulse
     * @classdesc Beats per minute (BPM) automatic detection with Web Audio API.
     * @param {object} options Options available for Pulse.
     * @param {function} options.onComplete Fired when Pulse has finished to compute main data: beat, significant peaks.
     * @param {function} options.onRequestProgress Fired when the XHR object is downloading data.
     * @param {function} options.onRequestSuccess Fired when the XHR object has successfully finished.
     * @param {function} options.onRequestAbort Fired when the XHR object has aborted.
     * @param {function} options.onRequestError Fired when the XHR object has an error occured.
     * @param {boolean} [options.convertToMilliseconds=true] If false, significant peaks are in Hertz unit.
     * @param {boolean} [options.removeDuplicates=true] If false, all significant peaks are computed.
     * @returns {void}
     */
    var Pulse = function(options) {

        self = this;

        /**
         * @name Pulse#audioContext
         * @description The Audio Context object.
         * @type {object}
         */
        this.audioContext = this._getAudioContext();

        /**
         * @name Pulse#buffer
         * @description The buffer that contains audio data.
         * @type {object}
         * @default null
         */
        this.buffer = null;

        /**
         * @name Pulse#renderedBuffer
         * @description The rendered buffer in the offline audio context.
         * @type {object}
         * @default null
         */
        this.renderedBuffer = null;

        /**
         * @name Pulse#significantPeaks
         * @description The array of significant peaks found
         * @type {object}
         * @default null
         */
        this.significantPeaks = null;

        /**
         * @name Pulse#beat
         * @description The computed beat including milliseconds and beat per minute.
         * @type {object}
         * @default {ms: null, bpm: null};
         */
        this.beat = {
            ms: null,
            bpm: null
        };

        /**
         * @name Pulse#REQUEST_PROGRESS
         * @description State when a request is in progress.
         * @type {number}
         * @readonly
         */
        Object.defineProperty(this, "REQUEST_PROGRESS", {
            value: 101,
            writable: false
        });

        /**
         * @name Pulse#REQUEST_LOAD
         * @description State when a request is downloading.
         * @type {number}
         * @readonly
         */
        Object.defineProperty(this, "REQUEST_LOAD", {
            value: 102,
            writable: false
        });

        /**
         * @name Pulse#REQUEST_ERROR
         * @description State when a request has an error.
         * @type {number}
         * @readonly
         */
        Object.defineProperty(this, "REQUEST_ERROR", {
            value: 1102,
            writable: false
        });

        /**
         * @name Pulse#REQUEST_ABORT
         * @description State when a request is aborted.
         * @type {number}
         * @readonly
         */
        Object.defineProperty(this, "REQUEST_ABORT", {
            value: 104,
            writable: false
        });

        /**
         * @name Pulse#WEB_AUDIO_API_NOT_SUPPORTED
         * @description State when the browser does not support Web Audio API.
         * @type {number}
         * @readonly
         */
        Object.defineProperty(this, "WEB_AUDIO_API_NOT_SUPPORTED", {
            value: 1001,
            writable: false
        });

        // init state
        var state;

        var changeIndex;

        /**
         * @name Pulse#state
         * @description The state of a Pulse operation.
         * @type {number}
         */
        Object.defineProperty(this, "state", {
            get: function() {
                return parseInt(state, 10);
            },
            set: function(s) {
                if (s == state) {
                    return;
                }

                this.notify({
                    type: "update",
                    name: "state",
                    oldValue: s
                });

                state = s;
            }
        });

        /**
         * @name Pulse#options
         * @description Options available for Pulse.
         * @type {object}
         * @default {}
         */
        Object.defineProperty(this, "options", {
            get: function() {
                return options || this.getDefaultOptions();
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

        // init options
        this.options = options;
    };

    Pulse.prototype.notify = function(change) {
        if(
            change.type === "update" &&
            change.name === "state" &&
            change.lastValue != self.state
        ) {
            switch(self.state) {
                case self.READY :
                    return "READY";
                break;

                case self.WEB_AUDIO_API_NOT_SUPPORTED :
                    return "WEB_AUDIO_API_NOT_SUPPORTED";
                break;

                case self.REQUEST_PROGRESS :
                    return "REQUEST_PROGRESS";
                break;

                case self.REQUEST_LOAD :
                    return "REQUEST_LOAD";
                break;

                case self.REQUEST_ERROR :
                    return "REQUEST_ERROR";
                break;

                case self.REQUEST_ABORT :
                    return "REQUEST_ABORT";
                break;

                default :
                    return "STATE_NOT_IMPLEMENTED_YET";
                break;
            }
        }
    };

    /**
     * @method Pulse#_getAudioContext
     * @access private
     * @description Get the audio context of the browser.
     * @returns {AudioContext|object} The audio context object or null if the browser is not supported Web Audio API.
     */
     Pulse.prototype._getAudioContext = function() {
        try {
            global.AudioContext = global.AudioContext || global.webkitAudioContext;
            return new global.AudioContext();
        } catch(e) {
            this.state = this.WEB_AUDIO_API_NOT_SUPPORTED;
            return null;
        }
    };

    /**
     * @method Pulse#getDefaultOptions
     * @description Get the default options.
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
     * @method Pulse#loadBufferFromURI
     * @description Load a song from an URI.
     * @param {string} uri The URI of the song.
     * @returns {boolean} Always true but the request event has more information.
     */
     Pulse.prototype.loadBufferFromURI = function(uri) {

        if(this.audioContext === null) {
            return false;
        }

        var request = new global.XMLHttpRequest();

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
     * @method Pulse#_requestProgress
     * @access private
     * @description _requestProgress description
     * @param {RequestEvent} event The request event object
     * @param {XmlHttpRequest} request The XHR object
     * @returns {void}
     */
    Pulse.prototype._requestProgress = function(event, request) {
        this.state = this.REQUEST_PROGRESS;
        this.options.onRequestProgress(this, request, event);
    };

    /**
     * @method Pulse#_requestLoad
     * @access private
     * @description The method is called in the request load event.
     * @param {RequestEvent} event The request event object
     * @param {XmlHttpRequest} request The XHR object
     * @returns {void}
     */
    Pulse.prototype._requestLoad = function(event, request) {
        if(request.readyState === request.DONE) {
            this.buffer = request.response;
            this.state = this.REQUEST_LOAD;
            this.options.onRequestSuccess(this, request, event);
            this._process();
        } else {
            this._requestError(event, request, this.options);
        }
    };

    /**
     * @method Pulse#_requestError
     * @access private
     * @description The method is called in the request error event.
     * @param {RequestEvent} event The request event object
     * @param {XmlHttpRequest} request The XHR object
     * @returns {void}
     */
    Pulse.prototype._requestError = function(event, request) {
        this.state = this.REQUEST_ERROR;
        this.options.onRequestError(this, request, event);
    };

    /**
     * @method Pulse#_requestAbort
     * @access private
     * @description The method is called in the request abort event.
     * @param {RequestEvent} event The request event object
     * @param {XmlHttpRequest} request The XHR object
     * @returns {void}
     */
    Pulse.prototype._requestAbort = function(event, request) {
        this.state = this.REQUEST_ABORT;
        this.options.onRequestAbort(this, request, event);
    };

    /**
     * @method Pulse#_process
     * @access private
     * @description Process to decode audio data, if fails it sends a DECODING_ERROR status.
     * @return {void}
     */
    Pulse.prototype._process = function() {
        this.audioContext.decodeAudioData(
            this.buffer,
            this._processCallback,
            function() {
                self.state = self.DECODING_ERROR;
            }
        );
    };

    /**
     * @method Pulse#_getOfflineContext
     * @access private
     * @description Get the offline audio context and set nodes and filters.
     * @return {OfflineAudioContext}
     */
    Pulse.prototype._getOfflineContext = function(buffer) {
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
     * @method Pulse#_processCallback
     * @access private
     * @description Callback after audio data is decoded.
     * @return {void}
     */
    Pulse.prototype._processCallback = function(buffer) {

        var offlineContext = self._getOfflineContext(buffer);

        offlineContext.oncomplete = function(event) {
            self.renderedBuffer = event.renderedBuffer;
            self.significantPeaks = self.getSignificantPeaks(event);
            self.beat = self.getBeat(self.significantPeaks);

            // give a user callback
            self.options.onComplete(event, self);
        };

        offlineContext.startRendering();
    };

    /**
     * @method Pulse#_getChannelDataMinMax
     * @description Get the min/max of a channel data.
     * @return {object}
     */
    Pulse.prototype._getChannelDataMinMax = function(channelData) {
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
     * @method Pulse#getSignificantPeaks
     * @description Get the significant peaks.
     * @return {object}
     */
    Pulse.prototype.getSignificantPeaks = function() {

        var channelData = this.renderedBuffer.getChannelData(0),
            limit = this._getChannelDataMinMax(channelData),
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
     * @method Pulse#getBeat
     * @description Get the beat in milliseconds and beat per minute.
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

        /**
         * TODO this needs to be improved
         */

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

        /**
         * TODO this needs to be improved
         */

        // compare ms with all other time beats
        referenceMs = msBetween.slice(0, 3);
        for (i = 0; i < referenceMs.length; i++) {
            sumMargins.push(0);
            for (j in msBetween) {
                sumMargins[i] += msBetween[j].ms % referenceMs[i].ms;
            }
        }

        /**
         * TODO this needs to be improved
         */

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
     * @method Pulse#getExtrapolatedPeaks
     * @description Get the extrapolated peaks regarding the computed beat.
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