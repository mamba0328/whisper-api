import asyncHandler from "express-async-handler";
import { Request, Response } from "express";

import { UserContacts } from "../models/UserContacts";

import { getValidators, postValidators, deleteValidators } from "../middleware/validation/userContactsValidators";
import { handleValidationErrors } from "../helpers/handleValidationErrors";

export const getUserContacts = [
    ...getValidators,
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
    ...postValidators,
    asyncHandler(async (req:Request, res:Response) => {
        const {
            user_id,
            contact_id
        } = req.body;


        handleValidationErrors(req, res);

        const newUserContact = await UserContacts.create({
            user_id,
            contact_id
        });

        res.send(newUserContact);
    })
];

export const deleteUserContacts = [
    ...deleteValidators,
    asyncHandler(async (req:Request, res:Response) => {
        const { id } = req.params;

        handleValidationErrors(req, res);

        await UserContacts.findByIdAndDelete(id);

        res.send(true);
    })
];

