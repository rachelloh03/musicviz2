import "./App.css";
import { useEffect, useRef, useState } from "react";
import { PerspectiveTransform } from "react-perspective-transform";
import { lightKey } from "./keyActions/lightKey";
import { useFutureNotes } from "./FutureNotesProvider/useFutureNotes";
import { TIME_THRESH, getAlpha, FUTURE_NOTES_THRESH } from "./constants";

export default function App() {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const { qRef, curTimeRef } = useFutureNotes();
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let animId;
    const canvas = canvasRef.current;
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext("2d");
    ctxRef.current = ctx;
    const animate = () => {
      // light keys
      if (!ctx || !canvas) {
        animId = requestAnimationFrame(animate);
        return;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      qRef.current.forEach((token) => {
        if (
          token.time - TIME_THRESH <= curTimeRef.current &&
          curTimeRef.current < token.time
        ) {
          lightKey(
            canvasRef.current,
            token.note,
            `rgba(0, 131, 225,${getAlpha(curTimeRef.current, token.time)})`
          );
        } else if (
          token.time < curTimeRef.current &&
          curTimeRef.current <= token.time + token.duration
        ) {
          lightKey(canvasRef.current, token.note, "rgba(239, 17, 17, 1)");
        }
      });

      qRef.current = qRef.current.filter(
        (token) => curTimeRef.current < token.time + token.duration
      );

      if (qRef.current.length > FUTURE_NOTES_THRESH) {
        qRef.current.length = 0;
      }

      animId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animId);
    //eslint-disable-next-line
  }, []);

  const handleMIDIMessage = () => (event) => {
    const [status, midi, velocity] = event.data;
    if (status === 144 && velocity > 0 && midi === 36) {
      // clear queue when pedal is pressed
      if (!isPaused) {
        qRef.current.clear();
        ctxRef.current.clearRect(
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height
        );
        setIsPaused(true);
      } else {
        setIsPaused(false);
      }
    }
  };

  useEffect(() => {
    let midiAccess;

    navigator
      .requestMIDIAccess()
      .then((access) => {
        midiAccess = access;
        for (const input of midiAccess.inputs.values()) {
          input.onmidimessage = handleMIDIMessage();
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
