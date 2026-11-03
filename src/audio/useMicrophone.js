import {useEffect, useRef, useState} from "react";
// average of the values between two positions in the list, scaled to 0-1
function average(data, from, to) {
    let sum = 0;
    for (let i = from; i<to; i++) {
        sum += data[i];
    }
    return sum/ (to - from)/ 255;
}

export function useMicrophone() {
    // thing that should update the screen 
    const [listening, setListening] = useState(false);
    const [error, setError] = useState("");

    //things we need to remember but taht do not redraw the screen
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null); 
    const streamRef= useRef(null);
    const dataRef = useRef(null);

    async function start() {
        setError("");
        try{
            // ask the browser for the microphone, permission popup
            const stream = await navigator.mediaDevices.getUserMedia({audio: true}); 

            //build the audio pipeline: microphone -> analyser
            const audioContext = new AudioContext();
            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize= 256; //gives us 128 frequecny bands
            analyser.smoothingTimeConstant = 0.8; //smooths out sudden jumps
            source.connect(analyser); 

            //save everything for later
            streamRef.current = stream;
            audioContextRef.current = audioContext;
            analyserRef.current = analyser;
            dataRef.current = new Uint8Array(analyser.frequencyBinCount);


            setListening(true);
        } catch(err) {
            if (err.name === "NotAllowedError") {
                setError("Microphone access was blocked. Allow it in your browser and try again.");
            } else if (err.name === "NotFoundError") {
                setError("No microphone was found on this device.");
            } else {
                setError("Could not start the microphone.");
            }
        }
    }
    function stop() {
        //turn off the mic, this removes the red recording dot in the browser tab
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
        }
        streamRef.current = null;
        audioContextRef.current = null;
        analyserRef.current = null;
        setListening(false); 
    }

    //called whenever we want the current sound levels
    function getAudioData() {
        if (!analyserRef.current) {
            return { volume: 0, bass:0, mid:0, treble:0};
        }
    // fill our list with the current loudness of each frequency band 
        analyserRef.current.getByteFrequencyData(dataRef.current);

        const data = dataRef.current;
        return {
            volume: average(data, 0, 128), //everything
            bass: average(data, 0, 3), //deep part of the voice
            mid: average(data, 3, 16), //main body of the voice
            treble: average(data, 16, 60), //sharp sounds like "s" and "t"
        };
    }
    //safety: turn the mic off if the page is closed 
    useEffect(() => {
        return() => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
            }
        };
    }, []);

    return {listening, error, start, stop, getAudioData};
}