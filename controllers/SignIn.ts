import { body } from "express-validator";
import passport from "../passport/passport";
import { Request, Response } from "express";
export const signIn = [
    body("identity_field").isString().trim().escape(),
    body("password").isString(),
    passport.authenticate("local", { failureMessage: true }),
    // @ts-ignore
    (req:Request, res:Response) => res.send(req.user!._id)
];


