import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRouter from "./routes/auth.js";
import profileRouter from "./routes/profile.js";
import requestsRouter from "./routes/requests.js";
import userRouter from "./routes/user.js";
import messagesRouter from "./routes/messages.js";

const app = express();

const ALLOWLIST = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
  origin(origin, cb) {
    if (!origin) return cb(null, true);
    if (ALLOWLIST.includes(origin)) return cb(null, true);
    return cb(new Error("CORS"));
  },
  credentials: true,
  methods: ["GET","HEAD","PUT","PATCH","POST","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
  optionsSuccessStatus: 204
};

app.use((req, res, next) => { res.header("Vary", "Origin"); next(); });
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

app.get("/", (_req, res) => res.send("ok"));

app.use("/auth", authRouter);
app.use("/profile", profileRouter);
app.use("/requests", requestsRouter);
app.use("/user", userRouter);
app.use("/messages", messagesRouter);

export default app;
