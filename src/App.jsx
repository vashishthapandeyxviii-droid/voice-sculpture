import {useEffect} from "react";
import "./App.css";
import SculptureCanvas from "./components/SculptureCanvas";
import { useMicrophone } from "./audio/useMicrophone";

function App(){
  const {listening, error, start, stop, getAudioData} = useMicrophone(); // custom hook for microphone access 
 
  // function to handle the toggle of microphone state
function handleToggle(){
  if (listening) {
    stop();
  } else {
    start();
  }
}
//Temporary: print the sound levels so we can test. DELETE THIS LATER
useEffect(() => {
  if (!listening) return;
  const id = setInterval(() => {
    const {volume, bass, mid, treble} = getAudioData();
    console.log(
      "vol", volume.toFixed(2),
      "bass", bass.toFixed(2),
      "mid", mid.toFixed(2),
      "treble", treble.toFixed(2)
    );
  }, 200);
  return () => clearInterval(id);
}, [listening, getAudioData]); 

return(
  <div className= "app">
    <SculptureCanvas /> 
    <h1 className="title"> Voice Sculpture</h1>

    <button className= "mic-button" onClick={handleToggle}> 
      {listening?"Stop Microphone":"Start Microphone"}
    </button>

    <p className= "status">
      {error? error: listening ? "Listening....." : "Microphone is off"}
    </p>
  </div>
);
}
export default App; 