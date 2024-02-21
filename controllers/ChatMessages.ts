import { query, body, param } from "express-validator";
import asyncHandler from "express-async-handler";
import { Request, Response } from "express";

import { Error } from "../types/types";

import { Chats } from "../models/Chats";
import { Users } from "../models/Users";
import { ChatMessages } from "../models/ChatMessages";

import { checkEntityExistsInDataBaseById } from "../helpers/checkEntityExistsInDB";
import { handleValidationErrors } from "../helpers/handleValidationErrors";

export const getChatMessages = [
    query("skip").isNumeric().optional(),
    query("limit").isNumeric().optional(),
    query("chat_id").isMongoId().custom(async (id:string) => checkEntityExistsInDataBaseById(id, Chats)),
    asyncHandler(async (req:Request, res:Response) => {
        const {
            chat_id,
            limit,
            skip
        } = req.query;

        handleValidationErrors(req, res);

        const messages = await ChatMessages.find({ chat_id }).skip(+skip! || 0).limit(+limit! || 50).sort("-created_at");

        res.send(messages);
    })
];
export const postChatMessage = [
    body("user_id").isMongoId().custom(async (id:string) => checkEntityExistsInDataBaseById(id, Users)),
    body("chat_id").isMongoId().custom(async (id:string) => checkEntityExistsInDataBaseById(id, Chats)),
    body("body").isString().trim().isLength({ min: 1, max: 3000 }),
    // body("img_url").isArray(), ?? img as a blob -> send to the hosting -> receive url?
    asyncHandler(async (req:Request, res:Response) => {
        const { user_id, chat_id, body } : { user_id: string, chat_id:string, body:string } = req.body;

        handleValidationErrors(req, res);

        const chat = await Chats.findById(chat_id);

        // @ts-ignore
        if (!chat!.chat_users.includes(user_id)) {
            const error:Error = new Error("Such user don't participate in the chat");
            error.status = 400;
            throw error;
        }

        const newMessage = await ChatMessages.create({
            user_id,
            chat_id,
            body
        });

        res.send(newMessage);
    })
];

export const putChatMessage = [
    param("id").isMongoId().custom(async (id:string) => await checkEntityExistsInDataBaseById(id, ChatMessages)),
    body("body").isString().trim().isLength({ min: 1, max: 3000 }),
    // body("img_url").isArray(), ?? img as a blob -> send to the hosting -> receive url?
    asyncHandler(async (req:Request, res:Response) => {
        const { id } = req.params;
        const {
            body
        } = req.body;

        handleValidationErrors(req, res);

        const now = new Date();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await ChatMessages.findByIdAndUpdate(id, {
            body,
            updated_at: now.toISOString()
        });

        const updatedMessage = await ChatMessages.findById(id);

        res.send(updatedMessage);
    })
];

export const deleteChatMessage = [
    param("id").isMongoId().custom(async (id:string) => await checkEntityExistsInDataBaseById(id, ChatMessages)),
    asyncHandler(async (req:Request, res:Response) => {
        const { id } = req.params;

        handleValidationErrors(req, res);

        await Chats.findByIdAndDelete(id);

        res.send(true);
    })
];

