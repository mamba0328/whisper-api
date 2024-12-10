import mongoose, { Types } from "mongoose";
import asyncHandler from "express-async-handler";
import { Request, Response } from "express";

import { ChatMessages } from "../models/ChatMessages";
import { MessagesImgs } from "../models/MessagesImgs";

import { getValidators, postValidators, deleteValidators, putValidators } from "../middleware/validation/chatMessagesValidators";
import { handleValidationErrors } from "../helpers/handleValidationErrors";

import { messageImgUpload } from "../middleware/multer/messageImgUpload";
import { createImgSmallCopy } from "../helpers/createImgSmallCopy";

import { createEntityForUploadedImg } from "../helpers/createEntityForUploadedImg";
import { deleteFile } from "../helpers/deleteFile";
import { Message } from "../types/types";

export const getChatMessages = [
    ...getValidators,
    asyncHandler(async (req:Request, res:Response) => {
        const {
            chat_id,
            limit,
            skip
        } = req.query;

        handleValidationErrors(req, res);

        const matchStage = {
            $match: {
            // @ts-ignore
                ...chat_id && { chat_id: new mongoose.Types.ObjectId(chat_id) }
            }
        };

        const lookupMessageSeenByStage = {
            $lookup: {
                from: "message_seen_by",
                localField: "_id",
                foreignField: "message_id",
                as: "message_seen_by"
            }
        };

        const lookupMessageImgStage = {
            $lookup: {
                from: "messages_imgs",
                localField: "_id",
                foreignField: "message_id",
                as: "message_imgs"
            }
        };


        const skipStage = { $skip: +skip! || 0 };
        const limitStage = { $limit: +limit! || 50 };
        const sortStage = { $sort: { "created_at": -1 } };

        const pipeline = [matchStage, skipStage, limitStage, sortStage, lookupMessageSeenByStage, lookupMessageImgStage];

        // @ts-ignore
        const messages = await ChatMessages.aggregate(pipeline);

        // const messages = await ChatMessages.find({ chat_id }).skip(+skip! || 0).limit(+limit! || 50).sort("-created_at");

        res.send(messages);
    })
];
export const postChatMessage = [
    messageImgUpload.single("message_img"),
    ...postValidators,
    asyncHandler(async (req:Request, res:Response) => {
        const { user_id, chat_id, body } : { user_id: Types.ObjectId, chat_id:Types.ObjectId, body:string } = req.body;

        handleValidationErrors(req, res);

        const now = new Date();

        const message:Message = {
            user_id,
            chat_id,
            status: "new", // TODO better types
            ...body && { body },
            created_at: now.toISOString()
        };

        const newMessage = await ChatMessages.create(message);

        if (req.file) {
            const img = await createEntityForUploadedImg({ file: req.file, message_id: newMessage._id }, MessagesImgs);
            message.message_imgs = [img];

            createImgSmallCopy(req.file.path);
        }

        res.send(message);
    })
];

export const putChatMessage = [
    ...putValidators,
    asyncHandler(async (req:Request, res:Response) => {
        const { id } = req.params;
        const {
            body
        } = req.body;

        handleValidationErrors(req, res);

        const now = new Date();

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await ChatMessages.findByIdAndUpdate(id, {
            body,
            status: "edited",
            updated_at: now.toISOString()
        });

        const updatedMessage = await ChatMessages.findById(id).populate("message_img_id");

        res.send(updatedMessage);
    })
];

export const deleteChatMessage = [
    ...deleteValidators,
    asyncHandler(async (req:Request, res:Response) => {
        const { id } = req.params;

        handleValidationErrors(req, res);

        const message_img = await MessagesImgs.findOne({ chat_message_id: id });
        if (message_img) {
            deleteFile(message_img.path);
            await MessagesImgs.findByIdAndUpdate(message_img._id);
        }

        await ChatMessages.findByIdAndDelete(id);

        res.send(true);
    })
];

