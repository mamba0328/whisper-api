import { query, body, validationResult } from "express-validator";
import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";

import { Users } from "../models/Users";
import { Error } from "../types/types";

export const getUsers = [
    query("skip").isNumeric().optional(),
    query("limit").isNumeric().optional(),
    query("first_name").isString().optional(),
    query("last_name").isString().optional(),
    query("username").isString().optional(),
    query("phone_number").isString().optional(),
    query("email").isString().optional(),
    asyncHandler(async (req:Request, res:Response) => {
        const {
            first_name,
            last_name,
            username,
            phone_number,
            email,
            limit,
            skip
        } = req.query;

        const result = validationResult(req);
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

        const users = await Users.find(findOptions).skip(+skip! || 0).limit(+limit! || 50).select("-password");
        // const users = await Users.find();

        res.send(users);
    })
];

export const postUsers = [
    body("first_name").isString().isLength({ min: 1, max: 100 }).escape(),
    body("last_name").isString().isLength({ min: 1, max: 100 }).escape(),
    body("username").isString().isLength({ min: 1, max: 100 }).escape(),
    body("date_of_birth").optional().isDate(),
    body("user_img").optional(), // ?
    body("phone_number").isString().isLength({ min: 6, max: 12 }),
    body("email").isString().isLength({ min: 4, max: 100 }),
    body("password").isString().isLength({ min: 8, max: 100 }),
    asyncHandler(async (req:Request, res:Response) => {
        const {
            first_name,
            last_name,
            username,
            phone_number,
            email,
            date_of_birth,
            user_img,
            password
        } = req.body;

        const result = validationResult(req);
        // @ts-ignore
        const errors = result.errors;

        if (errors.length) {
            res.status(400).json(errors);

            return;
        }

        const userWithUniqueDataAlreadyExists = await Users.findOne({ $or: [{ "username": username }, { "phone_number": phone_number }, { "email": email }] });

        if (userWithUniqueDataAlreadyExists) {
            const error:Error = new Error("User with such data already exists");
            error.status = 400;

            throw error;
        }

        const encryptedPassword = await bcrypt.hash(<string>password, 10);

        const newUser = await Users.create({
            first_name,
            last_name,
            username,
            phone_number,
            email,
            date_of_birth,
            user_img,
            password: encryptedPassword
        });

        res.send(newUser);
    })
];

export const putUsers = [
    body("first_name").optional().isString().isLength({ min: 1, max: 100 }).escape(),
    body("last_name").optional().isString().isLength({ min: 1, max: 100 }).escape(),
    body("username").optional().isString().isLength({ min: 1, max: 100 }).escape(),
    body("date_of_birth").optional().isDate(),
    body("user_img").optional(),
    asyncHandler(async (req:Request, res:Response) => {
        const { id } = req.params;
        const {
            first_name,
            last_name,
            username,
            date_of_birth,
            user_img
        } = req.body;

        const result = validationResult(req);
        // @ts-ignore
        const errors = result.errors;

        if (errors.length) {
            res.status(400).json(errors);

            return;
        }

        const userExists = await Users.findById(id);

        if (!userExists) {
            const error:Error = new Error("Such user doesn't exists");
            error.status = 400;

            throw error;
        }

        await Users.findByIdAndUpdate(id, {
            ...first_name && { first_name },
            ...last_name && { last_name },
            ...username && { username },
            ...date_of_birth && { date_of_birth },
            ...user_img && { user_img }
        });

        const updatedUser = await Users.findById(id);

        res.send(updatedUser);
    })
];

export const deleteUsers = [
    asyncHandler(async (req:Request, res:Response) => {
        const { id } = req.params;

        const userExists = await Users.findById(id);

        if (!userExists) {
            const error:Error = new Error("Such user doesn't exists");
            error.status = 400;

            throw error;
        }

        await Users.findByIdAndDelete(id);

        res.send(true);
    })
];

