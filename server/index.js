import oscPkg from "osc";
const osc = oscPkg.default ?? oscPkg;
import { WebSocketServer } from "ws";
import { MAX_LAST_TOKENS } from "./constants.js";

const oscPort = new osc.UDPPort({
  localAddress: "0.0.0.0",
  localPort: 9005,
  metadata: true,
});

oscPort.open();
console.log("Listening for OSC on UDP port", oscPort.options.localPort);

const wss = new WebSocketServer({ port: 8081 });
console.log("WebSocket server listening on port", wss.options.port);

let lastTimeValue = null;
let lastTokens = new Set();

wss.on("connection", (ws) => {
  console.log("Client connected to WebSocket.");

  // eslint-disable-next-line
  oscPort.on("message", (oscMsg, timeTag, info) => {
    if (ws.readyState === ws.OPEN) {
      const { address, args } = oscMsg;

      // Deduplicate /time messages
      if (address === "/time") {
        const arr = new Uint8Array(Object.values(args[0].value));
        const dataView = new DataView(arr.buffer);
        const timeValue = dataView.getUint32(0, true);

        if (timeValue === lastTimeValue) {
          return;
        }
        lastTimeValue = timeValue;
      }

      // Deduplicate /token messages
      if (address === "/token") {
        const arr = new Uint8Array(Object.values(args[0].value));
        const dataView = new DataView(arr.buffer);
        const time = dataView.getUint32(0, true);
        const instrument = dataView.getUint8(6);
        const note = dataView.getUint8(7);
        const tokenKey = `${time}-${instrument}-${note}`;

        if (lastTokens.has(tokenKey)) {
          return;
        }
        lastTokens.add(tokenKey);

        if (lastTokens.size > MAX_LAST_TOKENS) {
          const firstToken = lastTokens.values().next().value;
          lastTokens.delete(firstToken);
        }
      }

      ws.send(JSON.stringify(oscMsg));
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected from WebSocket.");
  });
});
