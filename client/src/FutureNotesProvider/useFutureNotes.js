import { useContext } from "react";
import { FutureNotesContext } from "./FutureNotesContext";

export const useFutureNotes = () => useContext(FutureNotesContext);
