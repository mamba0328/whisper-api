import asyncHandler from "express-async-handler";
import { Request, Response } from "express";

import { Error } from "../types/types";

import { Chats } from "../models/Chats";
import { ChatMessages } from "../models/ChatMessages";

import { getValidators, postValidators, deleteValidators, putValidators } from "../middleware/validation/chatMessagesValidators";
import { handleValidationErrors } from "../helpers/handleValidationErrors";

export const getChatMessages = [
    ...getValidators,
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
    ...postValidators,
    asyncHandler(async (req:Request, res:Response) => {
        const { user_id, chat_id, body } : { user_id: string, chat_id:string, body:string } = req.body;

        handleValidationErrors(req, res);


        const newMessage = await ChatMessages.create({
            user_id,
            chat_id,
            body
        });

        res.send(newMessage);
    })
];

export const putChatMessage = [
    ...putValidators,
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
    ...deleteValidators,
    asyncHandler(async (req:Request, res:Response) => {
        const { id } = req.params;

        handleValidationErrors(req, res);

        await Chats.findByIdAndDelete(id);

        res.send(true);
    })
];

