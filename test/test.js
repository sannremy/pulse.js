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

QUnit.test("Pulse options callbacks", function(assert) {

    assert.ok(function() {
        var pulse = new Pulse();
        return pulse.loadBufferFromURI("assets/song.mp3");
    }, 'loadBufferFromURI works as expected and Web Audio API is supported by the browser');

    // var done = assert.async();
    // var pulse = new Pulse({
    //     onRequestSuccess: function(event, request) {
    //         assert.ok(function() {
    //             return true;
    //         }, 'ok');
    //         done();
    //     }
    // });

    // pulse.loadBufferFromURI("assets/song.mp3");

});

QUnit.test( "assert.async() test", function( assert ) {
  var done = assert.async();

  var input = document.activeElement;

  var requestSuccess = function(event, request) {
    assert.equal( document.activeElement, input, "Input was focused" );
    done();
  };

  var pulse = new Pulse({
    onRequestSuccess: function(event, request) {
        assert.equal( document.activeElement, input, "Input was focused" );
        done();
      }
  });

  pulse.loadBufferFromURI("assets/song.mp3");


  // var input = document.activeElement;
  // setTimeout(function() {
  //   assert.equal( document.activeElement, input, "Input was focused" );
  //   done();
  // });
});

// QUnit.test( "a Promise-returning test", function( assert ) {
//  var done = assert.async();

//  setTimeout(function() {
//   var pulse = new Pulse();
//     pulse.onComplete = function(event, pulse) {
//         var extrapolatedPeaks = pulse.getExtrapolatedPeaks(
//             pulse.renderedBuffer,
//             pulse.significantPeaks,
//             pulse.beat
//         );

//         assert.ok(function() {
//             return typeof pulse.renderedBuffer === 'object';
//         }, 'pulse.renderedBuffer is an object');
//         done();
//     };
//     pulse.loadBufferFromURI("assets/song.mp3");
//   }, 0);
// });

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