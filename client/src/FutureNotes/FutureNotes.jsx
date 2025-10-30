import { useEffect, useState } from "react";
import { lightKey } from "../keyActions/lightKey";
import { unlightKey } from "../keyActions/unlightKey";

export const FutureNotes = ({ canvasRef, currTime }) => {
  // const [notes, setNotes] = useState([]);
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

        console.log({ time, duration, instrument, note });
        if (note === 129) console.log("BarSeparator");
        if (note === 130) console.log("ClearQueue");

        // setNotes((prev) => [...prev, { time, duration, instrument, note }]);
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

  // useEffect(() => {
  //   for (let i = 0; i < notes.length; i++) {
  //     const note = notes[i];
  //     if (note.note < 129 && note.time <= currTime + futureThresh) {
  //       lightKey(canvasRef.current, note.note, "green");
  //     } else if (note.time === currTime) {
  //       unlightKey(canvasRef.current, note.note);
  //     } // need to unlight everthing if clearQueue
  //   }
  //   // eslint-disable-next-line
  // }, [notes, canvasRef]);
  return null;
};

// export const FutureNotes = () => {
//   const [notes, setNotes] = useState([]);

//   useEffect(() => {
//     const ws = new WebSocket("ws://localhost:8081"); // browser client connects to ws server on 8081

//     ws.onopen = () => {
//       console.log("WebSocket connection established");
//     };

//     ws.onmessage = (event) => {
//       // runs whenever a new message is received
//       const msg = JSON.parse(event.data);
//       if (msg.address == "/token") {
//         const value = msg.args[0].value;
//         const arr = new Uint8Array(Object.values(value));
//         const dataView = new DataView(arr.buffer);
//         const time = dataView.getUint32(0, true);
//         const duration = dataView.getUint16(4, true);
//         const instrument = dataView.getUint8(6);
//         const note = dataView.getUint8(7);

//         console.log({ time, duration, instrument, note });
//         if (note === 129) console.log("BarSeparator");
//         if (note === 130) console.log("ClearQueue");

//         setNotes((prev) => [...prev, { time, duration, instrument, note }]);
//       }
//     };

//     ws.onclose = () => {
//       console.log("WebSocket connection closed");
//     };

//     ws.onerror = (error) => {
//       console.error("WebSocket error:", error);
//     };

//     return () => ws.close();
//   }, []); // runs once on mount to connect to websocket server

//   return notes;
// };
