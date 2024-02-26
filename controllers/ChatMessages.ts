import asyncHandler from "express-async-handler";
import { Request, Response } from "express";

import { Chats } from "../models/Chats";
import { ChatMessages } from "../models/ChatMessages";
import { MessagesImg } from "../models/MessagesImg";

import { getValidators, postValidators, deleteValidators, putValidators } from "../middleware/validation/chatMessagesValidators";
import { handleValidationErrors } from "../helpers/handleValidationErrors";

import { messageImgUpload } from "../middleware/multer/messageImgUpload";
import { createEntityForUploadedImg } from "../helpers/createEntityForUploadedImg";
import { deleteFile } from "../helpers/deleteFile";

export const getChatMessages = [
    ...getValidators,
    asyncHandler(async (req:Request, res:Response) => {
        const {
            chat_id,
            limit,
            skip
        } = req.query;

        handleValidationErrors(req, res);

        const messages = await ChatMessages.find({ chat_id }).skip(+skip! || 0).limit(+limit! || 50).sort("-created_at");

        res.send(messages);
    })
];
export const postChatMessage = [
    messageImgUpload.single("message_img"),
    ...postValidators,
    asyncHandler(async (req:Request, res:Response) => {
        const { user_id, chat_id, body } : { user_id: string, chat_id:string, body:string } = req.body;

        handleValidationErrors(req, res);

        let message_img;
        if (req.file) {
            message_img = await createEntityForUploadedImg(req.file, MessagesImg);
        }
        const newMessage = await ChatMessages.create({
            user_id,
            chat_id,
            body,
            ...message_img && { img_url: message_img.path }
        });

        res.send(newMessage);
    })
];

export const putChatMessage = [
    messageImgUpload.single("message_img"),
    ...putValidators,
    asyncHandler(async (req:Request, res:Response) => {
        const { id } = req.params;
        const {
            body
        } = req.body;

        handleValidationErrors(req, res);

        let message_img;
        if (req.file) {
            message_img = await createEntityForUploadedImg(req.file, MessagesImg);
        }

        const now = new Date();

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const previousEntity = await ChatMessages.findByIdAndUpdate(id, {
            body,
            ...message_img && { message_img_id: message_img._id },
            updated_at: now.toISOString()
        }).populate("message_img_id");

        const messageImgWasUpdated = message_img && previousEntity!.message_img_id;

        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        messageImgWasUpdated && deleteFile(previousEntity.message_img_id.path);


        const updatedMessage = await ChatMessages.findById(id).populate("message_img_id");

        res.send(updatedMessage);
    })
];

export const deleteChatMessage = [
    ...deleteValidators,
    asyncHandler(async (req:Request, res:Response) => {
        const { id } = req.params;

        handleValidationErrors(req, res);

        await Chats.findByIdAndDelete(id);

        res.send(true);
    })
];

