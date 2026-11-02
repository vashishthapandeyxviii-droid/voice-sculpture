import {useState} from "react";
import "./App.css";
import SculptureCanvas from "./components/SculptureCanvas"; 

function App(){
  const [listening, setListening] = useState(false); //camelCase 
 // for remembering whether mic is on or not

function handleToggle(){
  setListening(!listening);
}

return(
  <div className= "app">
    <SculptureCanvas/>
    <h1 className="title"> Voice Sculpture</h1>
    <button className= "mic-button" onClick={handleToggle}> 
      {listening?"Stop Microphone":"Start Miscophone"}

    </button>
    <p className= "status">
      {listening? "Listening.....": "Microphone is off"}
    </p>
  </div>
);
}
export default App; 