import asyncHandler from "express-async-handler";
import { Request, Response } from "express";

import { Chats } from "../models/Chats";

import { getValidators, postValidators, putValidators, deleteValidators } from "../middleware/validation/chatsValidators";
import { handleValidationErrors } from "../helpers/handleValidationErrors";

export const getChats = [
    ...getValidators,
    asyncHandler(async (req:Request, res:Response) => {
        const {
            chat_users,
            chat_name,
            is_group_chat,
            skip,
            limit
        } = req.query;

        handleValidationErrors(req, res);

        const findOptions = {
            // @ts-ignore
            ...chat_users && { chat_users: { "$in": chat_users.split(",") } },
            ...chat_name && { chat_name },
            ...is_group_chat && { is_group_chat }
        };

        const users = await Chats.find(findOptions).skip(+skip! || 0).limit(+limit! || 50);

        res.send(users);
    })
];
export const postChat = [
    ...postValidators,
    asyncHandler(async (req:Request, res:Response) => {
        const {
            is_group_chat,
            chat_name,
            chat_users
        } = req.body;

        handleValidationErrors(req, res);

        const newChat = await Chats.create({
            ...is_group_chat && { is_group_chat },
            ...chat_name && { chat_name },
            ...chat_users && { chat_users }
        });

        res.send(newChat);
    })
];

export const putChat = [
    ...putValidators,
    asyncHandler(async (req:Request, res:Response) => {
        const { id } = req.params;
        const {
            chat_name,
            chat_users
        } = req.body;

        handleValidationErrors(req, res);

        const now = new Date();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await Chats.findByIdAndUpdate(id, {
            ...chat_name && { chat_name },
            ...chat_users && { chat_users },
            updated_at: now.toISOString()
        });

        const updatedChat = await Chats.findById(id);

        res.send(updatedChat);
    })
];

export const deleteChat = [
    ...deleteValidators,
    asyncHandler(async (req:Request, res:Response) => {
        const { id } = req.params;

        handleValidationErrors(req, res);

        await Chats.findByIdAndDelete(id);

        res.send(true);
    })
];

