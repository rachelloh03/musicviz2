import { useEffect, useState, useCallback } from "react";
import { FutureNotesContext } from "./FutureNotesContext";

export const FutureNotesProvider = ({ children }) => {
  const [q, setQ] = useState([]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8081"); // browser client connects to ws server on 8081

    ws.onopen = () => {
      console.log("WebSocket connection established");
    };

    ws.onmessage = (event) => {
      // runs whenever a new message is received
      const msg = JSON.parse(event.data);
      if (msg.address == "/token") {
        const value = msg.args[0].value;
        const arr = new Uint8Array(Object.values(value));
        const dataView = new DataView(arr.buffer);
        const time = dataView.getUint32(0, true);
        const duration = dataView.getUint16(4, true);
        const instrument = dataView.getUint8(6);
        const note = dataView.getUint8(7);
        const parsedToken = { time, duration, instrument, note };
        console.log(parsedToken);
        if (note === 129) console.log("BarSeparator");
        if (note === 130) console.log("ClearQueue");

        setQ((prevQ) => {
          return [...prevQ, parsedToken];
        });
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

  const clearQ = useCallback(() => {
    setQ([]);
  }, []);

  const removeOldNotes = useCallback((curTime) => {
    setQ((prevQ) => {
      return prevQ
        .toArray()
        .filter((token) => token.time + token.duration < curTime);
    });
  }, []);

  return (
    <FutureNotesContext.Provider value={{ q, clearQ, removeOldNotes }}>
      {children}
    </FutureNotesContext.Provider>
  );
};
