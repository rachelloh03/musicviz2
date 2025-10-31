import { useEffect } from "react";

export const FutureNotes = ({ canvasRef, curTimeRef, q }) => {
  const futureThresh = 300; // 300 ms into future

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

        q.push(parsedToken);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => ws.close();
  }, [q]); // runs once on mount to connect to websocket server

  return null;
};
