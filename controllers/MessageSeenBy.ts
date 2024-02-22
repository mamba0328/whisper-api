import asyncHandler from "express-async-handler";
import { Request, Response } from "express";

import { MessageSeenBy } from "../models/MessageSeenBy";

import { getValidators, postValidators, deleteValidators } from "../middleware/validation/messageSeenByValidators";
import { handleValidationErrors } from "../helpers/handleValidationErrors";
export const getMessageSeenBy = [
    ...getValidators,
    asyncHandler(async (req:Request, res:Response) => {
        const {
            user_id,
            message_id,
            skip,
            limit
        } = req.query;

        handleValidationErrors(req, res);

        const findOptions = {
            // @ts-ignore
            ...user_id && { user_id },
            message_id
        };

        const usersMessageSeenBy = await MessageSeenBy.find(findOptions).skip(+skip! || 0).limit(+limit! || 50);

        res.send(usersMessageSeenBy);
    })
];
export const postMessageSeenBy = [
    ...postValidators,
    asyncHandler(async (req:Request, res:Response) => {
        const {
            user_id,
            message_id
        } = req.body;

        handleValidationErrors(req, res);

        const userSeenMessage = await MessageSeenBy.create({
            user_id,
            message_id
        });

        res.send(userSeenMessage);
    })
];

export const deleteMessageSeenBy = [
    ...deleteValidators,
    asyncHandler(async (req:Request, res:Response) => {
        const { id } = req.params;

        handleValidationErrors(req, res);

        await MessageSeenBy.findByIdAndDelete(id);

        res.send(true);
    })
];
