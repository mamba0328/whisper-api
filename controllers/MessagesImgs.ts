import asyncHandler from "express-async-handler";
import { Request, Response } from "express";


import { getValidators } from "../middleware/validation/messagesImgsValidators";
import { handleValidationErrors } from "../helpers/handleValidationErrors";
import { MessagesImgs } from "../models/MessagesImgs";


export const getMessageImg = [
    ...getValidators,
    asyncHandler(async (req:Request, res:Response) => {
        const { id } = req.params;

        handleValidationErrors(req, res);

        const messageImg = await MessagesImgs.findById(id);

        messageImg
            ? res.sendFile(messageImg.path)
            : res.send("No message img");
    })
];
