require("dotenv").config();

import createError from "http-errors";
import express, { Express, Request, Response } from "express";
import logger from "morgan";
import cookieParser from "cookie-parser";
import path from "path";
import session from "express-session";

import passport from "../passport/passport";

import indexRouter from "../routes";
import signInRouter from "../routes/sign-in";
import signUpRouter from "../routes/sign-up";
import signOutRouter from "../routes/sign-out";
import apiRouter from "../routes/api";

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
        this._killDataBaseConnection();
        this._setup404Handler();
        this._setupErrorHandler();

        return this.app;
    };

    private _configureDefaults = () => {
        this.app.use(logger("dev"));
        this.app.use(express.json());
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
        this.app.use(session({
            secret: process.env.PASSPORT_SECRET!,
            saveUninitialized: true,
            resave: true,
            cookie: {
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
