import { query, body, param } from "express-validator";
import asyncHandler from "express-async-handler";
import { Request, Response } from "express";

import { Users } from "../models/Users";
import { UserContacts } from "../models/UserContacts";

import { Error } from "../types/types";

import { checkEntityExistsInDataBaseById } from "../helpers/checkEntityExistsInDB";
import { handleValidationErrors } from "../helpers/handleValidationErrors";

export const getUserContacts = [
    query("skip").isNumeric().optional(),
    query("limit").isNumeric().optional(),
    query("username").isString().optional(),
    query("contact").isString().optional(),
    asyncHandler(async (req:Request, res:Response) => {
        const {
            username,
            contact,
            skip,
            limit
        } = req.query;

        handleValidationErrors(req, res);

        const findOptions = {
            ...username && { username },
            ...contact && { contact }
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


        handleValidationErrors(req, res);

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
    param("id").isMongoId().custom(async (id:string) => await checkEntityExistsInDataBaseById(id, UserContacts)),
    asyncHandler(async (req:Request, res:Response) => {
        const { id } = req.params;

        handleValidationErrors(req, res);

        await UserContacts.findByIdAndDelete(id);

        res.send(true);
    })
];

