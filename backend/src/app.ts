import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import session from "express-session";
import cookieParser from "cookie-parser";
import connectPgSimple from "connect-pg-simple";
import pg from "pg";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";
import path from "path";

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

const app: Express = express();
app.set("trust proxy", 1);

app.use(pinoHttp({
  logger,
  serializers: {
    req(req) { return { id: req.id, method: req.method, url: req.url?.split("?")[0] }; },
    res(res) { return { statusCode: res.statusCode }; },
  },
}));

app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser(process.env["SESSION_SECRET"] ?? "rizz-secret-2024"));

const PgSession = connectPgSimple(session);
const sessionPool = new pg.Pool({ connectionString: process.env["DATABASE_URL"] });

app.use(session({
  store: new PgSession({ pool: sessionPool, createTableIfMissing: true }),
  secret: process.env["SESSION_SECRET"] ?? "rizz-secret-2024",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env["NODE_ENV"] === "production",
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 30,
    sameSite: process.env["NODE_ENV"] === "production" ? "none" : "lax",
  },
}));

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
app.use("/api/uploads", express.static(path.resolve("./uploads")));
app.use("/api", router);

export default app;