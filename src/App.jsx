
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


return(
  <div className= "app">
    <SculptureCanvas getAudioData= {getAudioData} /> 
    <h1 className="title"> Voice Sculpture</h1>

    <button className={`mic-button ${listening ? "active" : ""}`} onClick={handleToggle}> 
      {listening?"Stop Microphone":"Start Microphone"}
    </button>

    <p className= "status">
      {error? error: listening ? "Listening....." : "Microphone is off"}
    </p>
  </div>
);
}
export default App; 