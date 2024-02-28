import { Error } from "../../types/types";

export const isAuth = (req:Express.Request, res:Response, next:CallableFunction) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        const error:Error = new Error("User is not authenticated");
        error.status = 401;
        throw error;
    }
};
