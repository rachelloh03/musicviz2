import { useEffect, useRef } from "react";
import { FutureNotesContext } from "./FutureNotesContext";
import { getRepetition } from "./getRepetition";

export const FutureNotesProvider = ({ children }) => {
  let qRef = useRef([]);
  const curTimeRef = useRef(null);
  const repetitionBufferRef = useRef([]);
  const REPETITION_WINDOW_MS = 10000; // 10 seconds

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8081"); // browser client connects to ws server on 8081

    ws.onopen = () => {
      console.log("WebSocket connection established");
    };

    ws.onmessage = (event) => {
      // runs whenever a new message is received
      const msg = JSON.parse(event.data);
      const rep = getRepetition(qRef, curTimeRef.current);
      if (rep) {
        console.log("REPETITION DETECTED");
      }
      if (msg) {
        const value = msg.args[0].value;
        const arr = new Uint8Array(Object.values(value));
        const dataView = new DataView(arr.buffer);
        if (msg.address === "/time") {
          curTimeRef.current = dataView.getUint32(0, true);
        } else if (msg.address === "/token") {
          const time = dataView.getUint32(0, true);
          const duration = dataView.getUint16(4, true);
          const instrument = dataView.getUint8(6);
          const note = dataView.getUint8(7);

          if (note === 130) {
            // 130 is ClearQueue
            qRef.current = [];
            repetitionBufferRef.current = [];
          } else if (note !== 129) {
            // 129 is BarSeparator
            const parsedToken = { time, duration, instrument, note };
            qRef.current.push(parsedToken);
            repetitionBufferRef.current.push(parsedToken);
            
            const latestTime = repetitionBufferRef.current[repetitionBufferRef.current.length - 1].time;
            const windowStart = latestTime - REPETITION_WINDOW_MS;
            
            const windowNotes = repetitionBufferRef.current.filter(
              (token) => token.time >= windowStart && token.time <= latestTime
            );
            

            const windowRef = { current: windowNotes };
            const rep = getRepetition(windowRef, latestTime);
            if (rep) {
              console.log("REPETITION DETECTED in window ending at", latestTime);
            }
          }
        }
      }
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => ws.close();
  }, []); // runs once on mount to connect to websocket server

  return (
    <FutureNotesContext.Provider value={{ qRef, curTimeRef }}>
      {children}
    </FutureNotesContext.Provider>
  );
};
