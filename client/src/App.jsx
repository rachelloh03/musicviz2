import "./App.css";
import { useEffect, useRef } from "react";
import { PerspectiveTransform } from "react-perspective-transform";
import { lightKey } from "./keyActions/lightKey";
import { useFutureNotes } from "./FutureNotesProvider/useFutureNotes";
import {
  TIME_THRESH,
  MAX_FUTURE_NOTES,
  COLORS,
  MAIN_COLOR,
  getChordKey,
} from "./constants";

export default function App() {
  const canvasRef = useRef(null);
  const { qRef, curTimeRef } = useFutureNotes();
  const chordColorsRef = useRef(new Map());

  useEffect(() => {
    let animId;
    const canvas = canvasRef.current;
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext("2d");
    let colorI = 0;
    const animate = () => {
      if (!ctx || !canvas || curTimeRef.current === null) {
        animId = requestAnimationFrame(animate);
        return;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // group tokens by chords
      const chords = new Map();
      qRef.current.forEach((token) => {
        const chord = getChordKey(token);
        if (!chords.has(chord)) {
          chords.set(chord, [token]);
        } else {
          chords.get(chord).push(token);
        }
      });

      // remove chord colors that are in the past
      for (const chord of chordColorsRef.current.keys()) {
        if (!chords.has(chord)) {
          chordColorsRef.current.delete(chord);
        }
      }

      // set each chord to be same color
      for (const chord of chords.keys()) {
        if (!chordColorsRef.current.has(chord)) {
          // single notes will be MAIN_COLOR
          if (chords.get(chord).length === 1) {
            chordColorsRef.current.set(chord, MAIN_COLOR);
          } else {
            chordColorsRef.current.set(chord, COLORS[colorI % COLORS.length]);
            colorI += 1;
          }
        } else if (
          chords.get(chord).length > 1 &&
          chordColorsRef.current.get(chord) === MAIN_COLOR
        ) {
          chordColorsRef.current.set(chord, COLORS[colorI % COLORS.length]);
          colorI += 1;
        }
      }

      // light keys
      qRef.current.forEach((token) => {
        if (
          token.time - TIME_THRESH <= curTimeRef.current &&
          curTimeRef.current <= token.time + token.duration
        ) {
          const chord = getChordKey(token);
          lightKey(
            canvasRef.current,
            token.note,
            curTimeRef.current,
            token.time,
            chordColorsRef.current.get(chord)
          );
        }
      });

      qRef.current = qRef.current.filter(
        (token) => curTimeRef.current <= token.time + token.duration
      );

      if (qRef.current.length > MAX_FUTURE_NOTES) {
        qRef.current.splice(0, qRef.current.length - MAX_FUTURE_NOTES);
      }

      animId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animId);
    //eslint-disable-next-line
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
