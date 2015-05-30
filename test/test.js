var getTestFile = function() {
    return "assets/song.mp3?" + Math.random();
};

QUnit.test("Pulse options returning types", function(assert) {

    assert.ok(function() {
        var pulse = new Pulse();
        return typeof pulse.options.onComplete === 'function';
    }, 'onComplete is a function');

    assert.ok(function() {
        var pulse = new Pulse();
        return typeof pulse.options.onRequestProgress === 'function';
    }, 'onRequestProgress is a function');

    assert.ok(function() {
        var pulse = new Pulse();
        return typeof pulse.options.onRequestSuccess === 'function';
    }, 'onRequestSuccess is a function');

    assert.ok(function() {
        var pulse = new Pulse();
        return typeof pulse.options.onRequestAbort === 'function';
    }, 'onRequestAbort is a function');

    assert.ok(function() {
        var pulse = new Pulse();
        return typeof pulse.options.onRequestError === 'function';
    }, 'onRequestError is a function');

    assert.ok(function() {
        var pulse = new Pulse();
        return typeof pulse.options.convertToMilliseconds === 'boolean';
    }, 'convertToMilliseconds is a boolean');

    assert.ok(function() {
        var pulse = new Pulse();
        return typeof pulse.options.removeDuplicates === 'boolean';
    }, 'removeDuplicates is a boolean');
});

QUnit.test("Pulse basic load", function(assert) {

    assert.ok(function() {
        var pulse = new Pulse();
        return pulse.loadBufferFromURI(getTestFile());
    }, 'loadBufferFromURI works as expected and Web Audio API is supported by the browser');
});

var requestCallbacks = [
    'onRequestSuccess',
    'onRequestProgress'
];

for(var i = 0; i < requestCallbacks.length; i++) {
    (function(callback) {
        QUnit.test("Pulse " + callback + " successful request callback", function(assert) {
            assert.expect(1);
            var done = assert.async();
            var options = {};
            options[callback] = function(pulse, request, requestEvent) {
                assert.ok(true, callback + ' returns expected parameters');
                done();
            };

            var pulse = new Pulse(options);
            pulse.loadBufferFromURI(getTestFile());
        });
    })(requestCallbacks[i]);
}

var errorCallbacks = [
    'onRequestAbort',
   //'onRequestError' // TODO
];

for(var i = 0; i < errorCallbacks.length; i++) {
    (function(callback) {
        QUnit.test("Pulse " + callback + " failed callback", function(assert) {
            assert.expect(1);
            var done = assert.async();
            var options = {
                onRequestProgress: function(pulse, request, requestEvent) {
                    request.abort();
                }
            };
            options[callback] = function() {
                assert.ok(true, callback + ' returns expected parameters');
                done();
            };

            var pulse = new Pulse(options);
            pulse.loadBufferFromURI('not/found/' + getTestFile());
        });
    })(errorCallbacks[i]);
}

QUnit.test("Pulse methods", function(assert) {
    assert.expect(4);
    var done = assert.async();

    var pulse = new Pulse({
        onComplete: function(event, pulse) {
            var extrapolatedPeaks = pulse.getExtrapolatedPeaks(
                pulse.renderedBuffer,
                pulse.significantPeaks,
                pulse.beat
            );

            assert.ok(function() {
                return typeof pulse.renderedBuffer === 'object';
            }, 'pulse.renderedBuffer is an object');
            
            assert.ok(function() {
                return typeof pulse.significantPeaks === 'object';
            }, 'pulse.significantPeaks is an object');

            assert.ok(function() {
                return typeof pulse.beat.ms === 'number' && typeof pulse.beat.bpm === 'number';
            }, 'pulse.beat has the expected object');
            
            assert.ok(function() {
                return typeof extrapolatedPeaks === 'object';
            }, 'pulse.getExtrapolatedPeaks returns an object');

            done();
        }
    });

    pulse.loadBufferFromURI(getTestFile());
});
