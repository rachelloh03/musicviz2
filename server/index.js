import oscPkg from "osc";
const osc = oscPkg.default ?? oscPkg;
import { WebSocketServer } from "ws";

const oscPort = new osc.UDPPort({
  localAddress: "0.0.0.0",
  localPort: 9005,
  metadata: true,
});

oscPort.open();
console.log("Listening for OSC on UDP port", oscPort.options.localPort);

const wss = new WebSocketServer({ port: 8081 });
console.log("WebSocket server listening on port", wss.options.port);

wss.on("connection", (ws) => {
  console.log("Client connected to WebSocket.");

  // eslint-disable-next-line
  oscPort.on("message", (oscMsg, timeTag, info) => {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(oscMsg));
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected from WebSocket.");
  });
});
