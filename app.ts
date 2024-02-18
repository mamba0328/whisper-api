import { Request, Response } from "express";
import { Error } from "./types/types";
import { connectToMongoDB, disconnectFromMongoDB } from "./db/mongooseConnection";

const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

import indexRouter from "./routes/index";
import apiRouter from "./routes/api";

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(connectToMongoDB);

app.use("/", indexRouter);
app.use("/api", apiRouter);

// catch 404 and forward to error handler
app.use(function (req:Request, res:Response, next:CallableFunction) {
    next(createError(404));
});

// error handler
app.use(function (err:Error, req:Request, res:Response) {
    res.status(err.status || 500).json(err);
});

app.use(disconnectFromMongoDB);

export default app;
