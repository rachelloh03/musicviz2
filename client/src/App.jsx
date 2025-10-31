import "./App.css";
import { useEffect, useRef, useState } from "react";
import { PerspectiveTransform } from "react-perspective-transform";
import { lightKey } from "./keyActions/lightKey";
import { unlightKey } from "./keyActions/unlightKey";
import { Deque } from "@datastructures-js/deque";
import { FutureNotes } from "./FutureNotes/FutureNotes";

export default function App() {
  const canvasRef = useRef(null);
  // const [futureNotes, setFutureNotes] = useState([]);
  const curTimeRef = useRef(Date.now());
  // const futureNotesQ = new Deque();

  useEffect(() => {
    let animId;
    const canvas = canvasRef.current;
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext("2d");
    const animate = () => {
      curTimeRef.current = Date.now();
      // light keys
      if (!ctx || !canvas) {
        return;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      animId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleMIDIMessage = (color) => (event) => {
    const [status, midi, velocity] = event.data;
    if (status === 144 && velocity > 0) {
      // note on
      lightKey(canvasRef.current, midi, color);
    } else if ((status == 144 && velocity == 0) || status == 128) {
      // note off
      unlightKey(canvasRef.current, midi);
    }
  };

  useEffect(() => {
    let midiAccess;

    navigator
      .requestMIDIAccess()
      .then((access) => {
        midiAccess = access;
        for (const input of midiAccess.inputs.values()) {
          if (input.name === "GarageBand Virtual Out") {
            continue;
          }
          const color = input.name === "Piaggero" ? "purple" : "red";
          // human played notes are purple, jambot notes are red
          input.onmidimessage = handleMIDIMessage(color);
        }
      })
      .catch((err) => console.error("MIDI not supported", err));

    return () => {
      // Cleanup MIDI listeners
      if (midiAccess) {
        for (const input of midiAccess.inputs.values()) {
          input.onmidimessage = null;
        }
      }
    };
  }, []);

  return (
    <div style={{ width: 400, height: 300, border: "1px solid #ccc" }}>
      {/* <FutureNotes canvasRef={canvasRef} currTime={curTimeRef} /> */}
      <PerspectiveTransform>
        <img src="/keyboard.JPG" alt="keyboard" style={{ width: "100%" }} />
        <canvas
          ref={canvasRef}
          width={400}
          height={300}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
          }}
        />
      </PerspectiveTransform>
    </div>
  );
}
