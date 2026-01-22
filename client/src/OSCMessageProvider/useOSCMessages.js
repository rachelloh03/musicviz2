import { useContext } from "react";
import { OSCMessageContext } from "./OSCMessageContext";

export const useOSCMessages = () => useContext(OSCMessageContext);
