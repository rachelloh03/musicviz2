import { useEffect, useRef } from "react";
import { FutureNotesContext } from "./FutureNotesContext";
import { MAX_RECENT_MSGS } from "./constants";

export const FutureNotesProvider = ({ children }) => {
  let qRef = useRef([]);
  let recentMsgsRef = useRef(new Set());
  const curTimeRef = useRef(0);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8081"); // browser client connects to ws server on 8081

    ws.onopen = () => {
      console.log("WebSocket connection established");
    };

    ws.onmessage = (event) => {
      // runs whenever a new message is received
      const msg = JSON.parse(event.data);
      const value = msg.args[0].value;
      const arr = new Uint8Array(Object.values(value));
      const dataView = new DataView(arr.buffer);
      let time;
      let msgId;
      if (msg.address === "/time") {
        time = dataView.getUint32(0, true);
        msgId = `${msg.address}-${time}`;
      } else if (msg.address === "/token") {
        time = dataView.getUint32(0, true);
        const note = dataView.getUint8(7);
        msgId = `${msg.address}-${time}-${note}`;
      }
      if (!recentMsgsRef.current.has(msgId)) {
        recentMsgsRef.current.add(msgId);
        if (msg.address === "/time") {
          curTimeRef.current = time;
          // console.log("q before clear:", [...qRef.current]);
          // qRef.current.length = 0;
          // console.log("time:", curTimeRef.current);
        } else if (msg.address === "/token") {
          const duration = dataView.getUint16(4, true);
          const instrument = dataView.getUint8(6);
          const note = dataView.getUint8(7);
          const parsedToken = { time, duration, instrument, note };
          qRef.current.push(parsedToken);
        }
      }

      if (recentMsgsRef.current.size > MAX_RECENT_MSGS) {
        recentMsgsRef.current.clear();
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
