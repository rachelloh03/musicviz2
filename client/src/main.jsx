import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { OSCMessageProvider } from "./OSCMessageProvider/OSCMessageProvider";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <OSCMessageProvider>
      <App />
    </OSCMessageProvider>
  </StrictMode>,
);
