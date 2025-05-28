/**
 * The Audio Worklet that get the real-time volume.
 */
class VolumeProcessor extends AudioWorkletProcessor {

    /** @type {number} @readonly */
    DB_GAIN = 94;

    constructor ()
    {
        super();
        this._buffer = new Float32Array(128);
    }

    /**
     * Process the audio source connected.
     * @param {array.array.Float32Array} inputs
     * @param {array.array.Float32Array} outputs
     * @returns {boolean}
     */
    process (inputs, outputs)
    {
        // If not datas are received.
        if (!inputs.length || !inputs[0] || !inputs[0].length) {
            console.warn("No audio data received.");
            return true;
        }

        // Get the first channel (mono) of the first input.
        this._buffer = inputs[0][0];

        // Get the volume in dB.
        let sum = this._buffer.reduce((a, b) => a + Math.pow(b, 2), 0);
        let average = sum / this._buffer.length;
        let rms = Math.sqrt(average);
        let db = 20 * Math.log10(rms);

        // Send the volume to the node.
        this.port.postMessage(db + this.DB_GAIN);

        // Keep receiving datas.
        return true;
    }
}

registerProcessor('VolumeProcessor', VolumeProcessor);
