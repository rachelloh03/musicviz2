import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { FutureNotesProvider } from "./FutureNotesProvider/FutureNotesProvider";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <FutureNotesProvider>
      <App />
    </FutureNotesProvider>
  </StrictMode>
);
