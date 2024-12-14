require("dotenv").config();
import socketIo from "socket.io";
import http from "http";
import { NextFunction, Request, Response } from "express";

import sessionMiddleware from "../passport/sessionMiddleware";
import passport from "../passport/passport";

import onlyForHandshake from "../passport/socketOnHandshake";
import handlers from "./handlers";

export default (server:http.Server) => {
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
                next();
            } else {
                res.writeHead(401);
                res.end();
            }
        })
    );


    io.on("connection", async (socket) => {
        try {
            // @ts-ignore
            await socket.join(socket.request.user._id.toString() as string);
        } catch (error) {
            console.log("fatal error");
        }

        handlers(io, socket);
    });

    return io;
};

