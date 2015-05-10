<a name="Pulse"></a>
## Pulse
Beats per minute (BPM) automatic detection with Web Audio API.

**Kind**: global class  

* [Pulse](#Pulse)
  * [new Pulse(options)](#new_Pulse_new)
  * [.audioContext](#Pulse#audioContext) : <code>object</code>
  * [.buffer](#Pulse#buffer) : <code>object</code>
  * [.renderedBuffer](#Pulse#renderedBuffer) : <code>object</code>
  * [.significantPeaks](#Pulse#significantPeaks) : <code>object</code>
  * [.beat](#Pulse#beat) : <code>object</code>
  * [.REQUEST_PROGRESS](#Pulse#REQUEST_PROGRESS) : <code>number</code>
  * [.REQUEST_LOAD](#Pulse#REQUEST_LOAD) : <code>number</code>
  * [.REQUEST_ERROR](#Pulse#REQUEST_ERROR) : <code>number</code>
  * [.REQUEST_ABORT](#Pulse#REQUEST_ABORT) : <code>number</code>
  * [.WEB_AUDIO_API_NOT_SUPPORTED](#Pulse#WEB_AUDIO_API_NOT_SUPPORTED) : <code>number</code>
  * [.status](#Pulse#status) : <code>number</code>
  * [.options](#Pulse#options) : <code>object</code>

<a name="new_Pulse_new"></a>
### new Pulse(options)

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>object</code> |  | Options available for Pulse. |
| options.onComplete | <code>function</code> |  | Fired when Pulse has finished to compute main data: beat, significant peaks. |
| options.onRequestProgress | <code>function</code> |  | Fired when the XHR object is downloading data. |
| options.onRequestSuccess | <code>function</code> |  | Fired when the XHR object has successfully finished. |
| options.onRequestAbort | <code>function</code> |  | Fired when the XHR object has aborted. |
| options.onRequestError | <code>function</code> |  | Fired when the XHR object has an error occured. |
| [options.convertToMilliseconds] | <code>boolean</code> | <code>true</code> | If false, significant peaks are in Hertz unit. |
| [options.removeDuplicates] | <code>boolean</code> | <code>true</code> | If false, all significant peaks are computed. |

<a name="Pulse#audioContext"></a>
### pulse.audioContext : <code>object</code>
The Audio Context object.

**Kind**: instance property of <code>[Pulse](#Pulse)</code>  
<a name="Pulse#buffer"></a>
### pulse.buffer : <code>object</code>
The buffer that contains audio data.

**Kind**: instance property of <code>[Pulse](#Pulse)</code>  
**Default**: <code>null</code>  
<a name="Pulse#renderedBuffer"></a>
### pulse.renderedBuffer : <code>object</code>
The rendered buffer in the offline audio context.

**Kind**: instance property of <code>[Pulse](#Pulse)</code>  
**Default**: <code>null</code>  
<a name="Pulse#significantPeaks"></a>
### pulse.significantPeaks : <code>object</code>
The array of significant peaks found

**Kind**: instance property of <code>[Pulse](#Pulse)</code>  
**Default**: <code>null</code>  
<a name="Pulse#beat"></a>
### pulse.beat : <code>object</code>
The computed beat including milliseconds and beat per minute.

**Kind**: instance property of <code>[Pulse](#Pulse)</code>  
**Default**: <code>{ms: null, bpm: null};</code>  
<a name="Pulse#REQUEST_PROGRESS"></a>
### pulse.REQUEST_PROGRESS : <code>number</code>
Status when a request is in progress.

**Kind**: instance property of <code>[Pulse](#Pulse)</code>  
**Read only**: true  
<a name="Pulse#REQUEST_LOAD"></a>
### pulse.REQUEST_LOAD : <code>number</code>
Status when a request is downloading.

**Kind**: instance property of <code>[Pulse](#Pulse)</code>  
**Read only**: true  
<a name="Pulse#REQUEST_ERROR"></a>
### pulse.REQUEST_ERROR : <code>number</code>
Status when a request has an error.

**Kind**: instance property of <code>[Pulse](#Pulse)</code>  
**Read only**: true  
<a name="Pulse#REQUEST_ABORT"></a>
### pulse.REQUEST_ABORT : <code>number</code>
Status when a request is aborted.

**Kind**: instance property of <code>[Pulse](#Pulse)</code>  
**Read only**: true  
<a name="Pulse#WEB_AUDIO_API_NOT_SUPPORTED"></a>
### pulse.WEB_AUDIO_API_NOT_SUPPORTED : <code>number</code>
Status when the browser does not support Web Audio API.

**Kind**: instance property of <code>[Pulse](#Pulse)</code>  
**Read only**: true  
<a name="Pulse#status"></a>
### pulse.status : <code>number</code>
The status of a Pulse operation.

**Kind**: instance property of <code>[Pulse](#Pulse)</code>  
<a name="Pulse#options"></a>
### pulse.options : <code>object</code>
Options available for Pulse.

**Kind**: instance property of <code>[Pulse](#Pulse)</code>  
**Default**: <code>{}</code>  
