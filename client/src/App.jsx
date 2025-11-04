import "./App.css";
import { useEffect, useRef, useState } from "react";
import { PerspectiveTransform } from "react-perspective-transform";
import { lightKey } from "./keyActions/lightKey";
import { unlightKey } from "./keyActions/unlightKey";
import { useFutureNotes } from "./FutureNotesProvider/useFutureNotes";

export default function App() {
  const canvasRef = useRef(null);
  const curTimeRef = useRef(Date.now());
  const { q, clearQ, removeOldNotes } = useFutureNotes();
  const [startTime, setStartTime] = useState(null);

  useEffect(() => {
    let animId;
    const canvas = canvasRef.current;
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext("2d");
    const animate = () => {
      // light keys
      if (!ctx || !canvas || !startTime || !q.length) {
        animId = requestAnimationFrame(animate);
        return;
      }
      curTimeRef.current = (Date.now() - startTime) / 10; // convert from ms to centiseconds
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // removeOldNotes(curTimeRef.current);
      // q.forEach((token) => {
      //   console.log(
      //     "token.time: ",
      //     token.time,
      //     " and curTime: ",
      //     curTimeRef.current,
      //     " and finaltime: ",
      //     token.time + token.duration
      //   );
      //   if (
      //     token.time <= curTimeRef.current &&
      //     curTimeRef.current <= token.time + token.duration
      //   ) {
      //     lightKey(canvasRef.current, token.note, "green");
      //     console.log("light key", token.note);
      //   }
      // });

      animId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animId);
    //eslint-disable-next-line
  }, [startTime]);

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

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.repeat) return;
      console.log(event.key);
      if (event.key == "Enter") {
        // clearQ();
        setStartTime(Date.now());
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div style={{ width: 400, height: 300, border: "1px solid #ccc" }}>
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
