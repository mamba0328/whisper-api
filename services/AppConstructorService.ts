require("dotenv").config();

import createError from "http-errors";
import express, { Express, Request, Response } from "express";
import logger from "morgan";
import cookieParser from "cookie-parser";
import path from "path";
import session from "express-session";
import cors from "cors";
import MongoStore from "connect-mongo";

import passport from "../passport/passport";

import indexRouter from "../routes";
import signInRouter from "../routes/sign-in";
import signUpRouter from "../routes/sign-up";
import signOutRouter from "../routes/sign-out";
import apiRouter from "../routes/api";
import staticRouter from "../routes/static/messages-imgs";

import { connectToMongoDB, disconnectFromMongoDB } from "../db/mongooseConnection";
import { Error } from "../types/types";
export class AppConstructorService {
    private app: Express;

    constructor () {
        this.app = express();
    }

    public getConfiguredApp = () => {
        this._configureDefaults();
        this._configureDataBaseConnection();
        this._configurePassportAuthentication();
        this._setupUnprotectedRoutes();
        this._setupProtectedRoutes();
        this._setupStaticRoutes();
        this._killDataBaseConnection();
        this._setup404Handler();
        this._setupErrorHandler();

        return this.app;
    };

    private _configureDefaults = () => {
        this.app.use(logger("dev"));
        this.app.use(express.json());
        this.app.use(cors({
            origin: ["http://localhost:9000", process.env.ALLOW_CORS_ORIGIN ?? "", process.env.ALLOW_CORS_ORIGIN_2 ?? ""],
            methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
            preflightContinue: false,
            optionsSuccessStatus: 204,
            credentials: true
        }));
        this.app.use(express.urlencoded({ extended: false }));
        this.app.use(cookieParser());
        this.app.use(express.static(path.join(__dirname, "public")));
    };

    private _configureDataBaseConnection = () => {
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        this.app.use(connectToMongoDB);
    };

    private _killDataBaseConnection = () => {
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        this.app.use(disconnectFromMongoDB);
    };

    private _configurePassportAuthentication = () => {
        if (process.env.NODE_ENV === "production") {
            this.app.set("trust proxy", 1);
        }

        this.app.use(session({
            secret: process.env.PASSPORT_SECRET!,
            saveUninitialized: true,
            proxy: true,
            resave: true,
            store: MongoStore.create({
                mongoUrl: process.env.NODE_ENV === "test" ? process.env.TEST_DB_MONGO_URI : process.env.MONGO_URI,
                autoRemove: "native"
            }),
            cookie: {
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV ? "none" : "strict",
                path: "/",
                maxAge: 24 * 60 * 60 * 1000 // day = hours * minutes * seconds * milliseconds
            }
        }));


        this.app.use(passport.initialize());
        this.app.use(passport.session());
    };

    private _setupUnprotectedRoutes = () => {
        this.app.use("/", indexRouter);
        this.app.use("/sign-in", signInRouter);
        this.app.use("/sign-up", signUpRouter);
        this.app.use("/sign-out", signOutRouter);
    };

    private _setupProtectedRoutes = () => {
        this.app.use("/api", apiRouter);
    };

    private _setupStaticRoutes = () => {
        this.app.use("/", staticRouter);
    };

    private _setup404Handler = () => {
        this.app.use(function (req:Request, res:Response, next:CallableFunction) {
            next(createError(404));
        });
    };

    private _setupErrorHandler = () => {
        this.app.use(function (err:Error, req:Request, res:Response) {
            res.status(err.status || 500).json(err);
        });
    };
}
