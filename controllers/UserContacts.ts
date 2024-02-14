import { query, body, validationResult } from "express-validator";
import asyncHandler from "express-async-handler";
import { Request, Response } from "express";

import { Users } from "../models/Users";
import { UserContacts } from "../models/UserContacts";
import { Error } from "../types/types";
export const getUserContacts = [
    query("skip").isNumeric().optional(),
    query("limit").isNumeric().optional(),
    query("username").isString().optional(),
    asyncHandler(async (req:Request, res:Response) => {
        const {
            username,
            skip,
            limit
        } = req.query;

        const result = validationResult(req);
        // @ts-ignore
        const errors = result.errors;

        if (errors.length) {
            res.status(400).json(errors);

            return;
        }

        const findOptions = {
            ...username && { username }
        };

        const users = await UserContacts.find(findOptions).skip(+skip! || 0).limit(+limit! || 50);

        res.send(users);
    })
];

export const postUserContacts = [
    body("user_id").isMongoId(),
    body("contact_id").isMongoId(),
    asyncHandler(async (req:Request, res:Response) => {
        const {
            user_id,
            contact_id
        } = req.body;

        const result = validationResult(req);
        // @ts-ignore
        const errors = result.errors;

        if (errors.length) {
            res.status(400).json(errors);

            return;
        }

        const usersWithIds = await Users.find({ _id: { $in: [user_id, contact_id] } });

        if (usersWithIds.length < 2) {
            const error:Error = new Error("No such user");
            error.status = 400;

            throw error;
        }

        const contactAlreadyExists = await UserContacts.findOne({ user_id, contact_id });

        if (contactAlreadyExists) {
            const error:Error = new Error("Contact already exists");
            error.status = 400;

            throw error;
        }

        const newUserContact = await UserContacts.create({
            user_id,
            contact_id
        });

        res.send(newUserContact);
    })
];

export const deleteUserContacts = [
    asyncHandler(async (req:Request, res:Response) => {
        const { id } = req.params;

        const userContactExists = await UserContacts.findById(id);

        if (!userContactExists) {
            const error:Error = new Error("Such user contact doesn't exists");
            error.status = 400;

            throw error;
        }

        await UserContacts.findByIdAndDelete(id);

        res.send(true);
    })
];

