import { body, param, query } from "express-validator";
import asyncHandler from "express-async-handler";
import { Request, Response } from "express";

import { Chats } from "../models/Chats";
import { Users } from "../models/Users";

import { Error } from "../types/types";

import { checkEntityExistsInDataBaseById } from "../helpers/checkEntityExistsInDB";
import { handleValidationErrors } from "../helpers/handleValidationErrors";

export const getUserContacts = [
    query("skip").isNumeric().optional(),
    query("limit").isNumeric().optional(),
    query("chat_users").isString().optional(),
    query("chat_name").isString().optional(),
    query("is_group_chat").isString().optional(),
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
            ...chat_users && { chat_users: chat_users.split(",") },
            ...chat_name && { chat_name },
            ...is_group_chat && { is_group_chat }
        };

        const users = await Chats.find(findOptions).skip(+skip! || 0).limit(+limit! || 50);

        res.send(users);
    })
];
export const postChat = [
    body("is_group_chat").optional().isBoolean(),
    body("chat_name").optional().isString().escape(),
    body("chat_users.*").isMongoId().bail({ level: "request" }),
    body("chat_users").isArray().custom(async (chat_users) => {
        if (!chat_users.length) {
            throw new Error("No empty chat_users");
        }
        await Promise.all([chat_users.map(async (id:string) => await checkEntityExistsInDataBaseById(id, Users))]);
    }),
    asyncHandler(async (req:Request, res:Response) => {
        const {
            is_group_chat,
            chat_name,
            chat_users
        } = req.body;

        handleValidationErrors(req, res);

        if (!is_group_chat) {
            const chatAlreadyExists = await Chats.findOne({ chat_users: { $all: chat_users }, is_group_chat: false });

            if (chatAlreadyExists) {
                const error:Error = new Error("Chat already exists");
                error.status = 400;

                throw error;
            }
        }

        const newChat = await Chats.create({
            ...is_group_chat && { is_group_chat },
            ...chat_name && { chat_name },
            ...chat_users && { chat_users }
        });

        res.send(newChat);
    })
];

export const putChat = [
    param("id").isMongoId().custom(async (id:string) => {
        await checkEntityExistsInDataBaseById(id, Chats);
        const chat = await Chats.findById(id);
        if (!chat!.is_group_chat) {
            throw new Error("Chat is not editable");
        }
    }),
    body("chat_name").optional().isString().escape(),
    body("chat_users").optional().isArray().custom(async (chat_users) => {
        await Promise.all([chat_users.map(async (id:string) => await checkEntityExistsInDataBaseById(id, Users))]);
    }),
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
    param("id").isMongoId().custom(async (id:string) => await checkEntityExistsInDataBaseById(id, Chats)),
    asyncHandler(async (req:Request, res:Response) => {
        const { id } = req.params;

        handleValidationErrors(req, res);

        await Chats.findByIdAndDelete(id);

        res.send(true);
    })
];

