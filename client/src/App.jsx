import "./App.css";
import { useEffect, useRef } from "react";
import { PerspectiveTransform } from "react-perspective-transform";
import { lightKey } from "./keyActions/lightKey";
// import { unlightKey } from "./keyActions/unlightKey";
import { useFutureNotes } from "./FutureNotesProvider/useFutureNotes";
import { TIME_THRESH, getAlpha } from "./constants";

export default function App() {
  const canvasRef = useRef(null);
  const { qRef, curTimeRef } = useFutureNotes();

  useEffect(() => {
    let animId;
    const canvas = canvasRef.current;
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext("2d");
    const animate = () => {
      // light keys
      if (!ctx || !canvas || !qRef.current.length) {
        animId = requestAnimationFrame(animate);
        return;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      qRef.current.forEach((token) => {
        if (
          token.time - TIME_THRESH <= curTimeRef.current &&
          curTimeRef.current <= token.time + token.duration
        ) {
          lightKey(
            canvasRef.current,
            token.note,
            `rgba(50,50,50,${getAlpha(curTimeRef.current, token.time)})`
          );
        }
      });

      qRef.current = qRef.current.filter(
        (token) => curTimeRef.current < token.time + token.duration
      );

      animId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animId);
    //eslint-disable-next-line
  }, []);

  // const handleMIDIMessage = (color) => (event) => {
  //   const [status, midi, velocity] = event.data;
  //   if (status === 144 && velocity > 0) {
  //     lightKey(canvasRef.current, midi, color);
  //   }
  //   // else if ((status == 144 && velocity == 0) || status == 128) {
  //   //   // note off
  //   //   unlightKey(canvasRef.current, midi);
  //   // }
  // };

  // useEffect(() => {
  //   let midiAccess;

  //   navigator
  //     .requestMIDIAccess()
  //     .then((access) => {
  //       midiAccess = access;
  //       for (const input of midiAccess.inputs.values()) {
  //         if (input.name === "GarageBand Virtual Out") {
  //           continue;
  //         }
  //         const color =
  //           input.name === "Piaggero"
  //             ? "rgba(109, 0, 225, 1)"
  //             : "rgba(239, 17, 17, 1)";
  //         // human played notes are purple, jambot notes are red
  //         input.onmidimessage = handleMIDIMessage(color);
  //       }
  //     })
  //     .catch((err) => console.error("MIDI not supported", err));

  //   return () => {
  //     // Cleanup MIDI listeners
  //     if (midiAccess) {
  //       for (const input of midiAccess.inputs.values()) {
  //         input.onmidimessage = null;
  //       }
  //     }
  //   };
  // }, []);

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
