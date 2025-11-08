import { io } from "socket.io-client";

// "undefined" means the URL will be computed from the `window.location` object
const URL = "ws://localhost:3500";

export const socket = io(URL);
