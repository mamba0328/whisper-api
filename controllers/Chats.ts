import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import mongoose from "mongoose";

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

        const matchStage = {
            $match: {
                // @ts-ignore
                //* converting to ObjectId is essential here, so DT match
                chat_users: { "$in": chat_users.split(",").map((id:string) => new mongoose.Types.ObjectId(id)) },
                ...chat_name && { chat_name },
                ...is_group_chat && { is_group_chat }
            }
        };

        const lookupLastMessageStage = {
            $lookup: {
                from: "chat_messages",
                localField: "_id",
                foreignField: "chat_id",
                as: "chat_messages",
                pipeline: [
                    { $sort: { "created_at": -1 } },
                    { $limit: 1 }
                ]
            }
        };

        const lookupUsersStage = {
            $lookup: {
                from: "users",
                localField: "chat_users",
                foreignField: "_id",
                as: "chat_users",
                pipeline: [
                    { $unset: ["password"] }
                ]
            }
        };

        const skipStage = { $skip: +skip! || 0 };
        const limitStage = { $limit: +limit! || 50 };
        const pipeline = [matchStage, skipStage, limitStage, lookupLastMessageStage, lookupUsersStage];

        // @ts-ignore
        const chats = await Chats.aggregate(pipeline);

        res.send(chats);
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

