import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

function App() {
  const [inputPath, setInputPath] = useState("");
  const [startTime, setStartTime] = useState("00:00:00");
  const [endTime, setEndTime] = useState("00:00:10");

  const handleTrim = async () => {
    if (!inputPath) {
      alert("Por favor, ingresa la ruta del vídeo.");
      return;
    }

    try {
      const result = await invoke<string>("run_trim", {
        start: startTime,
        end: endTime,
        input: inputPath,
        output: null        
      });

      alert(`Recorte completado. Guardado en: ${result}`);
    } catch (error) {
      alert(`Error: ${error}`);
    }
  };

  return (
    <main className="container">
      <h1>El mejor recortador de video</h1>

      <div className="input-group">
        <label>Ruta del vídeo:</label>
        <input 
          type="text"
          placeholder="C:\videos\partida.mp4"
          value={inputPath}
          onChange={(e) => setInputPath(e.target.value)}/>
      </div>

      <div>
        <div>
          <label>Inicio:</label>
          <input 
            type="text"
            placeholder="00:00:00"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
        />
        </div>

        <div>
          <label>Fin:</label>
          <input 
            type="text"
            placeholder="00:00:10"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>
      </div>

      <button onClick={handleTrim}>Recortar</button>
    </main>
  );
}

export default App;
