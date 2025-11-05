import "./App.css";
import { useEffect, useRef } from "react";
import { PerspectiveTransform } from "react-perspective-transform";
import { lightKey } from "./keyActions/lightKey";
import { useFutureNotes } from "./FutureNotesProvider/useFutureNotes";
import { TIME_THRESH, getAlpha, MAX_FUTURE_NOTES } from "./constants";

export default function App() {
  const canvasRef = useRef(null);
  const { qRef, curTimeRef } = useFutureNotes();
  const realTimeRef = useRef(null);

  useEffect(() => {
    let animId;
    const canvas = canvasRef.current;
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext("2d");
    const animate = () => {
      // light keys
      if (!ctx || !canvas || curTimeRef.current === null) {
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
