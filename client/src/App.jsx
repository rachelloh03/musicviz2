import "./App.css";
import { useEffect, useRef, useState } from "react";
import { PerspectiveTransform } from "react-perspective-transform";
import { lightKey } from "./keyActions/lightKey";
import { unlightKey } from "./keyActions/unlightKey";
import { FutureNotes } from "./FutureNotes/FutureNotes";

const getTime = () => {
  return Date.now();
};

export default function App() {
  const canvasRef = useRef(null);
  // const [futureNotes, setFutureNotes] = useState([]);
  const [curTime, setCurTime] = useState(getTime());

  // useEffect(() => {
  //   let animId;
  //   const updateTime = () => {
  //     const newTime = getTime();
  //     setCurTime(newTime);
  //     animId = requestAnimationFrame(updateTime);
  //   };
  //   updateTime();
  //   return () => cancelAnimationFrame(animId);
  // }, [curTime, setCurTime]);

  // useEffect(() => {
  //   const canvas = canvasRef.current;
  //   const animate = () => {
  //     if (canvas) {
  //       const ctx = canvas.getContext("2d");
  //       canvas.width = 400;
  //       canvas.height = 300;
  //       if (!ctx) {
  //         return;
  //       }
  //       ctx.clearRect(0,0,canvas.width, canvas.height);

  //     }
  //   }
  // }, [])

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
      <FutureNotes canvasRef={canvasRef} currTime={curTime} />
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
