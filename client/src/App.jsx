import "./App.css";
import { useEffect, useRef, useState } from "react";
import { PerspectiveTransform } from "react-perspective-transform";
import { lightKey } from "./keyActions/lightKey";
// import { displaySpeedometer } from "./displayGoodnessScore/displaySpeedometer";
import { displayProgressBar } from "./displayGoodnessScore/displayProgressBar";
import { useOSCMessages } from "./OSCMessageProvider/useOSCMessages";
import { TIME_THRESH, MAX_FUTURE_NOTES, ONE_SEC } from "./constants";
import {
  getColor,
  lightFutureRange,
  showFutureThresh,
} from "./keyActions/constants";

export default function App() {
  const canvasRef = useRef(null);
  const { qRef, curTimeRef, goodnessScoreRef } = useOSCMessages();
  // const { qRef, curTimeRef } = useOSCMessages();
  const [rectOn, setRectOn] = useState(true);
  const [notesOn, setNotesOn] = useState(true);
  const [futureThresh, setFutureThresh] = useState(TIME_THRESH);
  const [onlyBass, setOnlyBass] = useState(false);
  const rectOnRef = useRef(rectOn);
  const notesOnRef = useRef(notesOn);
  const futureThreshRef = useRef(futureThresh);
  const onlyBassRef = useRef(onlyBass);
  const futureThreshVisibleRef = useRef(false);
  const futureThreshTimeoutRef = useRef(null);
  const lastTriggerRef = useRef({});
  const activeMIDINotesRef = useRef(new Map());
  const roliRef = useRef(null);

  useEffect(() => {
    rectOnRef.current = rectOn;
  }, [rectOn]);

  useEffect(() => {
    notesOnRef.current = notesOn;
  }, [notesOn]);

  useEffect(() => {
    futureThreshRef.current = futureThresh;
  }, [futureThresh]);

  useEffect(() => {
    onlyBassRef.current = onlyBass;
  }, [onlyBass]);

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
      if (futureThreshVisibleRef.current) {
        showFutureThresh(canvas, futureThreshRef.current);
      }

      // light future range
      if (rectOnRef.current) {
        lightFutureRange(
          qRef.current,
          canvasRef.current,
          curTimeRef.current,
          futureThreshRef.current,
        );
      }

      // light future notes
      if (notesOnRef.current) {
        const futureTokens = qRef.current.filter(
          (token) =>
            token.time - futureThreshRef.current <= curTimeRef.current &&
            curTimeRef.current <= token.time + token.duration,
          // curTimeRef.current < token.time, // uncomment this line and comment above line if do not want to see note lit when playing
        );

        if (onlyBassRef.current) {
          // only light the lowest future note
          if (futureTokens.length > 0) {
            const bassToken = futureTokens.reduce((min, t) =>
              t.note < min.note ? t : min,
            );
            lightKey(
              canvasRef.current,
              bassToken.note,
              curTimeRef.current,
              bassToken.time,
              getColor(
                curTimeRef.current,
                bassToken.time,
                futureThreshRef.current,
              ),
              futureThreshRef.current,
              roliRef.current,
            );
          }

          // only light the lowest current note
          if (activeMIDINotesRef.current.size > 0) {
            const [bassNote, bassTime] = [
              ...activeMIDINotesRef.current.entries(),
            ].reduce((min, [midi, t]) => (midi < min[0] ? [midi, t] : min));
            lightKey(
              canvasRef.current,
              bassNote,
              curTimeRef.current,
              bassTime,
              getColor(curTimeRef.current, bassTime, futureThreshRef.current),
              futureThreshRef.current,
              roliRef.current,
            );
          }
        } else {
          futureTokens.forEach((token) => {
            lightKey(
              canvasRef.current,
              token.note,
              curTimeRef.current,
              token.time,
              getColor(curTimeRef.current, token.time, futureThreshRef.current),
              futureThreshRef.current,
              roliRef.current,
            );
          });

          for (const [midi, noteTime] of activeMIDINotesRef.current.entries()) {
            lightKey(
              canvasRef.current,
              midi,
              curTimeRef.current,
              noteTime,
              getColor(curTimeRef.current, noteTime, futureThreshRef.current),
              futureThreshRef.current,
              roliRef.current,
            );
          }
        }
      }

      qRef.current = qRef.current.filter(
        (token) => curTimeRef.current <= token.time + token.duration,
      );

      if (qRef.current.length > MAX_FUTURE_NOTES) {
        qRef.current.splice(0, qRef.current.length - MAX_FUTURE_NOTES);
      }

      // show goodness score
      // displaySpeedometer(canvasRef.current, goodnessScoreRef.current);
      if (goodnessScoreRef.current >= 0.0) {
        if (goodnessScoreRef.current || goodnessScoreRef.current == 0.0) {
          displayProgressBar(canvasRef.current, goodnessScoreRef.current);
        }
      }

      animId = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      cancelAnimationFrame(animId);
    };
    //eslint-disable-next-line
  }, []);

  const handleCurrMIDI = () => (event) => {
    const [status, midi, velocity] = event.data;

    if (status === 144 && velocity > 0) {
      activeMIDINotesRef.current.set(midi, curTimeRef.current);
    } else if (status === 128 || (status === 144 && velocity === 0)) {
      activeMIDINotesRef.current.delete(midi);
    }
  };

  const handleParams = () => (event) => {
    const [_status, pad] = event.data;

    const now = Date.now();
    const lastTrigger = lastTriggerRef.current[pad] || 0;

    // Ignore if triggered within last 200ms
    if (now - lastTrigger < 200) {
      return;
    }
    lastTriggerRef.current[pad] = now;

    if (pad === 0) {
      setRectOn((prev) => !prev);
    }
    if (pad === 1) {
      setFutureThresh((prev) => Math.max(0, prev - 50));
    }
    if (pad === 2) {
      setFutureThresh((prev) => Math.min(10 * ONE_SEC, prev + 50));
    }
    if (pad === 3) {
      setNotesOn((prev) => !prev);
    }
    if (pad === 4) {
      setOnlyBass((prev) => !prev);
    }
  };

  useEffect(() => {
    let midiAccess;

    navigator
      .requestMIDIAccess()
      .then((access) => {
        midiAccess = access;
        for (const input of midiAccess.inputs.values()) {
          if (
            input.name === "GarageBand Virtual Out" ||
            input.name === "LUMI Keys BLOCK"
          ) {
            continue;
          }
          if (input.name === "MPKmini2") {
            input.onmidimessage = handleParams();
            continue;
          }
          input.onmidimessage = handleCurrMIDI();
        }

        for (const output of midiAccess.outputs.values()) {
          if (output.name === "LUMI Keys BLOCK") {
            roliRef.current = output;
          }
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
    //eslint-disable-next-line
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
