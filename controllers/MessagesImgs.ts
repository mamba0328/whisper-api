
import { Request, Response } from "express";

import { staticValidators } from "../middleware/validation/messagesImgsValidators";
import { handleValidationErrors } from "../helpers/handleValidationErrors";

export const serveImg = [
    ...staticValidators,
    (req:Request, res:Response, next:CallableFunction) => {
        handleValidationErrors(req, res);
        next();
    },
    // (req:Request, _:Response, next:CallableFunction) => {
    //     if (!req.params.filename!.includes("-small")) {
    //         setTimeout(() => {
    //             next();
    //         }, 150000);
    //     } else {
    //         next();
    //     }
    // },
    (req:Request, res:Response) => res.sendFile(__dirname.replace("controllers", `/uploads/messages_imgs/${req.params.filename}`))
];
