import { Response } from "express";

export const signOut = (req:Express.Request, res:Response, next:CallableFunction) => {
    req.logout(function (err) {
        if (err) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return next(err);
        }
        res.send(true);
    });
};
