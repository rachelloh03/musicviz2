import "./App.css";
import { useEffect, useRef, useState } from "react";
import { PerspectiveTransform } from "react-perspective-transform";
import { lightKey } from "./keyActions/lightKey";
import { useFutureNotes } from "./FutureNotesProvider/useFutureNotes";
import { TIME_THRESH, MAX_FUTURE_NOTES } from "./constants";
import { getColor, lightFutureRange } from "./keyActions/constants";

export default function App() {
  const canvasRef = useRef(null);
  const { qRef, curTimeRef } = useFutureNotes();
  const [rectOn, setRectOn] = useState(true);

  useEffect(() => {
    let animId;
    const canvas = canvasRef.current;
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext("2d");
    const animate = () => {
      if (!ctx || !canvas || curTimeRef.current === null) {
        animId = requestAnimationFrame(animate);
        return;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // light future range
      if (rectOn) {
        lightFutureRange(qRef.current, canvasRef.current, curTimeRef.current);
      }

      // light current keys
      qRef.current.forEach((token) => {
        if (
          token.time - TIME_THRESH <= curTimeRef.current &&
          curTimeRef.current <= token.time + token.duration
        ) {
          lightKey(
            canvasRef.current,
            token.note,
            curTimeRef.current,
            token.time,
            getColor(curTimeRef.current, token.time)
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
  }, [rectOn]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.repeat) return; // prevent key repeat

      if (event.key == "r") {
        setRectOn((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div
      style={{
        backgroundColor: "#000",
        width: "100vw",
        height: "100vh",
      }}
    >
      <div
        style={{
          backgroundColor: "#000",
          width: 400,
          height: 300,
        }}
      >
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
    </div>
  );
}
