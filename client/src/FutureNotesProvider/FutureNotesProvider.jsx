import { useEffect, useRef } from "react";
import { FutureNotesContext } from "./FutureNotesContext";

export const FutureNotesProvider = ({ children }) => {
  const qRef = useRef([]);
  const curTimeRef = useRef(null);
  const oodScoreRef = useRef(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8081"); // browser client connects to ws server on 8081

    ws.onopen = () => {
      console.log("WebSocket connection established");
    };

    ws.onmessage = (event) => {
      // runs whenever a new message is received
      const msg = JSON.parse(event.data);
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
          } else if (note !== 129) {
            // 129 is BarSeparator
            const parsedToken = { time, duration, instrument, note };
            qRef.current.push(parsedToken);
          }
        } else if (msg.address === "/oodScore") {
          const score = dataView.getUint8(0);
          oodScoreRef.current = score;
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
    <FutureNotesContext.Provider value={{ qRef, curTimeRef, oodScoreRef }}>
      {children}
    </FutureNotesContext.Provider>
  );
};
