import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";

import { Users } from "../models/Users";
import { UsersProfileImg } from "../models/UsersProfileImg";
import { userProfileImgUpload } from "../middleware/multer/userProfileImgUpload";

import { writesInChatValidators, getValidators, postValidators, deleteValidators, putValidators } from "../middleware/validation/usersValidators";
import { handleValidationErrors } from "../helpers/handleValidationErrors";
import { createEntityForUploadedImg } from "../helpers/createEntityForUploadedImg";
import { deleteFile } from "../helpers/deleteFile";


export const getUsers = [
    ...getValidators,
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

        handleValidationErrors(req, res);

        const findOptions = {
            ...first_name && { first_name },
            ...last_name && { last_name },
            ...username && { username },
            ...phone_number && { phone_number },
            ...email && { email }
        };

        const users = await Users.find(findOptions).skip(+skip! || 0).limit(+limit! || 50).select("-password").populate("user_profile_img_id");
        // const users = await Users.find();

        res.send(users);
    })
];

export const postUsers = [
    userProfileImgUpload.single("user_profile_img"),
    ...postValidators,
    asyncHandler(async (req:Request, res:Response) => {
        const {
            first_name,
            last_name,
            username,
            phone_number,
            email,
            date_of_birth,
            password
        } = req.body;

        handleValidationErrors(req, res);

        let user_profile_img;
        if (req.file) {
            user_profile_img = await createEntityForUploadedImg(req.file, UsersProfileImg);
        }

        const encryptedPassword = await bcrypt.hash(<string>password, 10);

        const newUser = await Users.create({
            first_name,
            last_name,
            username,
            phone_number,
            email,
            date_of_birth,
            password: encryptedPassword,
            ...user_profile_img && { user_profile_img_id: user_profile_img._id }
        });

        // @ts-ignore
        newUser.user_profile_img_id = user_profile_img;

        res.send(newUser);
    })
];

export const putUsers = [
    userProfileImgUpload.single("user_profile_img"),
    ...putValidators,
    asyncHandler(async (req:Request, res:Response) => {
        const { id } = req.params;
        const {
            first_name,
            last_name,
            username,
            date_of_birth
        } = req.body;

        handleValidationErrors(req, res);

        let user_profile_img;
        if (req.file) {
            user_profile_img = await createEntityForUploadedImg(req.file, UsersProfileImg);
        }

        const now = new Date();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const previousEntity = await Users.findByIdAndUpdate(id, {
            ...first_name && { first_name },
            ...last_name && { last_name },
            ...username && { username },
            ...date_of_birth && { date_of_birth },
            ...user_profile_img && { user_profile_img_id: user_profile_img._id },
            updated_at: now.toISOString()
        }).populate("user_profile_img_id");

        const userProfileImgWasUpdated = user_profile_img && previousEntity!.user_profile_img_id;
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        userProfileImgWasUpdated && deleteFile(previousEntity.user_profile_img_id.path);

        const updatedUser = await Users.findById(id).populate("user_profile_img_id");

        res.send(updatedUser);
    })
];

export const deleteUsers = [
    ...deleteValidators,
    asyncHandler(async (req:Request, res:Response) => {
        const { id } = req.params;

        handleValidationErrors(req, res);

        await Users.findByIdAndDelete(id);

        res.send(true);
    })
];

export const updateUserWritesInChat = [
    ...writesInChatValidators,
    asyncHandler(async (req:Request, res:Response) => {
        const { id } = req.params;
        const { chat_id } = req.body;

        handleValidationErrors(req, res);

        await Users.findByIdAndUpdate(id, { writes_in_chat: chat_id });

        const updatedUser = await Users.findById(id);
        res.send(updatedUser);
    })
];
