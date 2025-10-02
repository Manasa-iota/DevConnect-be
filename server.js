import http from "http";
import { Server } from "socket.io";
import { initSocket } from "./socket/index.js";

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: process.env.FRONTEND_URL, credentials: true } });
initSocket(io);

connectDB().then(() => {
  server.listen(3000, () => console.log("listening on 3000"));
});

