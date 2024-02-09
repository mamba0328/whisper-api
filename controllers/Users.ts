import { query, body, validationResult } from "express-validator";
import asyncHandler from "express-async-handler";
import { Request, Response } from "express";

import { Users } from "../models/Users";

export const get = [
    query("skip").isNumeric().optional(),
    query("limit").isNumeric().optional(),
    asyncHandler(async (req:Request, res:Response) => {
        const { query } = req;
        const {
            first_name,
            last_name,
            username,
            phone_number,
            email,
            limit,
            skip
        } = query;

        const result = validationResult(query);
        // @ts-ignore
        const errors = result.errors;

        if (errors.length) {
            res.status(400).json(errors);

            return;
        }

        const findOptions = {
            ...first_name && { first_name },
            ...last_name && { last_name },
            ...username && { username },
            ...phone_number && { phone_number },
            ...email && { email }
        };

        const users = await Users.find(findOptions).skip(+skip! || 0).limit(+limit! || 50);

        res.send(users);
    })
];


