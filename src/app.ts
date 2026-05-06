import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./app/routes";
import path from "path";
import qs from "qs";
import config from "./config";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";

const app: Application = express();
app.set("query parser", (str: string) => qs.parse(str));

app.set("view engine", "ejs");
app.set("views", path.resolve(process.cwd(), `src/app/templates`));
// app.set("views", path.join(__dirname, "../templates"));

app.use(
  cors({
    origin: [
      config.frontend_url,
      config.Better_Auth.better_auth_url,
      "http://localhost:3000",
      "http://localhost:5000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use("/api/auth", toNodeHandler(auth));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.send({
    message: "Blog server is running.........",
  });
});

app.use("/api/v1", router);

app.use(globalErrorHandler);

export default app;
