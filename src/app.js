import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import testRouter from "./routes/test.route.js";
import userRouter from "./routes/user.route.js";
import chatBotRouter from "./routes/chatBot.routes.js";
import mlRouter from "./routes/ml.routes.js";
import parameterRouter from "./routes/parameter.route.js";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.use("/api/v1", testRouter);
app.use('/api/v1/user', userRouter);
app.use('/api/v1/chatBot', chatBotRouter);
app.use('/api/v1/ml', mlRouter);
app.use('/api/v1/parameters', parameterRouter);

export { app };





