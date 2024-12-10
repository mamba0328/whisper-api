#!/usr/bin/env node

/**
 * Module dependencies.
 */

require("dotenv").config();
import http from "http";
import socketIo from "socket.io";
const debug = require("debug")("whisper:server");

import app from "../app";

import onConnection from "../socketIo/onConnection";
import sessionMiddleware from "../passport/sessionMiddleware";
import onlyForHandshake from "../passport/socketOnHandshake";

import { Error } from "../types/types";
import passport from "../passport/passport";
import { NextFunction, Request, Response } from "express";

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || "3000");
app.set("port", port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);

/**
 * Create Socket.io server.
 */

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
const io = new socketIo.Server(server, {
    cors: {
        origin: process.env.ALLOW_CORS_ORIGIN!,
        methods: ["GET", "POST"],
        allowedHeaders: "*",
        credentials: true
    },
    cookie: true,
    serveClient: false
});

io.engine.use(onlyForHandshake(sessionMiddleware));
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
io.engine.use(onlyForHandshake(passport.session()));
io.engine.use(
    onlyForHandshake((req:Request, res:Response, next:NextFunction) => {
        if (req.user) {
            console.log("user");
            next();
        } else {
            res.writeHead(401);
            res.end();
        }
    })
);


io.on("connection", async (socket) => {
    await onConnection(io, socket);
});

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort (val:string) {
    const port = parseInt(val, 10);

    if (isNaN(port)) {
    // named pipe
        return val;
    }

    if (port >= 0) {
    // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError (error:Error) {
    if (error.syscall !== "listen") {
        throw error;
    }

    const bind = typeof port === "string"
        ? "Pipe " + port
        : "Port " + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
    case "EACCES":
        console.error(bind + " requires elevated privileges");
        process.exit(1);
        break;
    case "EADDRINUSE":
        console.error(bind + " is already in use");
        process.exit(1);
        break;
    default:
        throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening () {
    const addr = server.address();
    const bind = typeof addr === "string"
        ? "pipe " + addr
        : "port " + addr!.port;
    debug("Listening on " + bind);
    console.log("Listening on " + bind);
}
