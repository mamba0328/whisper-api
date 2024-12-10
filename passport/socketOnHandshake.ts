import { NextFunction, Request, Response } from "express";

export default (middleware: (req: Request, res: Response, next: any) => void,) => {
    return (req:Request, res:Response, next:NextFunction) => {
        // @ts-ignore
        const isHandshake = req._query.sid === undefined;
        if (isHandshake) {
            middleware(req, res, next);
        } else {
            next();
        }
    };
};

