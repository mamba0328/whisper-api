import { body } from "express-validator";
import passport from "../passport/passport";
import { Request, Response } from "express";
export const signIn = [
    body("identity_field").trim().escape(),
    body("password").escape(),
    passport.authenticate("local", { failureMessage: true }),
    (req:Request, res:Response) => res.send(true)
];


