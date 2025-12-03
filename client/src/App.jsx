import "./App.css";
import { useEffect, useRef, useState } from "react";
import { PerspectiveTransform } from "react-perspective-transform";
import { lightKey } from "./keyActions/lightKey";
import { useFutureNotes } from "./FutureNotesProvider/useFutureNotes";
import { TIME_THRESH, MAX_FUTURE_NOTES, ONE_SEC } from "./constants";
import {
  getColor,
  lightFutureRange,
  showFutureThresh,
} from "./keyActions/constants";

export default function App() {
  const canvasRef = useRef(null);
  const { qRef, curTimeRef } = useFutureNotes();
  const [rectOn, setRectOn] = useState(true);
  const [futureThresh, setFutureThresh] = useState(TIME_THRESH);
  const futureThreshVisibleRef = useRef(false);
  const futureThreshTimeoutRef = useRef(null);

  useEffect(() => {
    if (futureThreshTimeoutRef.current) {
      clearTimeout(futureThreshTimeoutRef.current);
    }

    futureThreshVisibleRef.current = true;

    // Hide it after 1 second
    futureThreshTimeoutRef.current = setTimeout(() => {
      futureThreshVisibleRef.current = false;
    }, 1000);

    return () => {
      if (futureThreshTimeoutRef.current)
        clearTimeout(futureThreshTimeoutRef.current);
    };
  }, [futureThresh]);

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
        lightFutureRange(
          qRef.current,
          canvasRef.current,
          curTimeRef.current,
          futureThresh
        );
      }

      // light current keys
      qRef.current.forEach((token) => {
        if (
          token.time - futureThresh <= curTimeRef.current &&
          curTimeRef.current <= token.time + token.duration
        ) {
          lightKey(
            canvasRef.current,
            token.note,
            curTimeRef.current,
            token.time,
            getColor(curTimeRef.current, token.time, futureThresh),
            futureThresh
          );
        }
      });

      qRef.current = qRef.current.filter(
        (token) => curTimeRef.current <= token.time + token.duration
      );

      if (qRef.current.length > MAX_FUTURE_NOTES) {
        qRef.current.splice(0, qRef.current.length - MAX_FUTURE_NOTES);
      }

      if (futureThreshVisibleRef.current) {
        showFutureThresh(canvas, futureThresh);
      }

      animId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animId);
    //eslint-disable-next-line
  }, [rectOn, futureThresh]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.repeat) return; // prevent key repeat

      if (event.key === "r") {
        setRectOn((prev) => !prev);
      }

      if (event.key === "ArrowUp") {
        // increase time thresh by half a sec
        setFutureThresh((prev) =>
          prev !== 10 * ONE_SEC ? (prev += 50) : 10 * ONE_SEC
        );
      }

      if (event.key === "ArrowDown") {
        setFutureThresh((prev) => (prev !== 0 ? (prev -= 50) : 0));
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    console.log("futureThresh: ", futureThresh);
  }, [futureThresh]);

  // useEffect(() => {
  //   const canvas = canvasRef.current;
  //   const ctx = canvas.getContext("2d");
  //   if (!ctx) return;
  //   let timeoutId;

  //   ctx.clearRect(0, 0, canvas.width, canvas.height);
  //   showFutureThresh(canvas, futureThresh);

  //   timeoutId = setTimeout(() => {
  //     ctx.clearRect(0, 0, canvas.width, canvas.height);
  //   }, ONE_SEC);

  //   return () => clearTimeout(timeoutId);
  // }, [futureThresh]);

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
