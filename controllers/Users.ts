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

        const encryptedPassword = await bcrypt.hash(<string>password, 10);

        const now = new Date();
        const newUser = await Users.create({
            first_name,
            last_name,
            username,
            phone_number,
            email,
            date_of_birth,
            password: encryptedPassword,
            create_at: now.toISOString()
        });

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


        const now = new Date();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await Users.findByIdAndUpdate(id, {
            ...first_name && { first_name },
            ...last_name && { last_name },
            ...username && { username },
            ...date_of_birth && { date_of_birth },
            // @ts-ignore
            updated_at: now.toISOString()
        });

        const updatedUser = await Users.findById(id);

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

        const profileImgs = await UsersProfileImg.find({ user_id: id });
        if (profileImgs.length) {
            await Promise.all(profileImgs.map(async (img) => {
                deleteFile(img.path);
                await UsersProfileImg.findByIdAndUpdate(img._id);
            }));
        }


        await Users.findByIdAndUpdate(id, { writes_in_chat: chat_id });

        const updatedUser = await Users.findById(id);
        res.send(updatedUser);
    })
];
