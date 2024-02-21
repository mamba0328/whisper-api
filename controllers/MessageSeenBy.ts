import { body, param, query } from "express-validator";
import asyncHandler from "express-async-handler";
import { Request, Response } from "express";

import { ChatMessages } from "../models/ChatMessages";
import { Users } from "../models/Users";
import { MessageSeenBy } from "../models/MessageSeenBy";

import { Error } from "../types/types";

import { checkEntityExistsInDataBaseById } from "../helpers/checkEntityExistsInDB";
import { handleValidationErrors } from "../helpers/handleValidationErrors";

export const getMessageSeenBy = [
    query("skip").isNumeric().optional(),
    query("limit").isNumeric().optional(),
    query("user_id").optional().isMongoId().custom(async (id:string) => checkEntityExistsInDataBaseById(id, Users)),
    query("message_id").isMongoId().custom(async (id:string) => checkEntityExistsInDataBaseById(id, ChatMessages)),
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
    body("user_id").isMongoId().custom(async (id:string) => checkEntityExistsInDataBaseById(id, Users)),
    body("message_id").isMongoId().custom(async (id:string) => checkEntityExistsInDataBaseById(id, ChatMessages)),
    asyncHandler(async (req:Request, res:Response) => {
        const {
            user_id,
            message_id
        } = req.body;

        handleValidationErrors(req, res);

        const messageAlreadySeenByTheUser = await MessageSeenBy.findOne({ user_id, message_id });
        if (messageAlreadySeenByTheUser) {
            const error: Error = new Error("User already seen the message");
            error.status = 400;

            throw error;
        }

        const userSeenMessage = await MessageSeenBy.create({
            user_id,
            message_id
        });

        res.send(userSeenMessage);
    })
];

export const deleteMessageSeenBy = [
    param("id").isMongoId().custom(async (id:string) => await checkEntityExistsInDataBaseById(id, MessageSeenBy)),
    asyncHandler(async (req:Request, res:Response) => {
        const { id } = req.params;

        handleValidationErrors(req, res);

        await MessageSeenBy.findByIdAndDelete(id);

        res.send(true);
    })
];
