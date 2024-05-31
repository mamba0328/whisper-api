import { param } from "express-validator";

import { Chats } from "../../models/Chats";
import { ChatMessages } from "../../models/ChatMessages";
import { MessagesImgs } from "../../models/MessagesImgs";

import { checkEntityExistsInDataBaseById } from "../../helpers/checkEntityExistsInDB";

import { Error, User } from "../../types/types";
import { Types } from "mongoose";

export const getValidators = [
    param("id").isMongoId().custom(async (message_img_id:Types.ObjectId) => checkEntityExistsInDataBaseById(message_img_id, MessagesImgs)).bail({ level: "request" }),
    param("id").custom(async (message_img_id:Types.ObjectId, { req }) => authenticatedUserHasAccessToTheChat(message_img_id, req.user as User)).bail({ level: "request" })
];

const checkUserParticipateInChat = async (user_id:Types.ObjectId, chat_id:Types.ObjectId) => {
    const chat = await Chats.findById(chat_id);

    // @ts-ignore
    if (!chat!.chat_users.includes(user_id)) {
        const error:Error = new Error("Such user don't participate in the chat");
        error.status = 400;
        throw error;
    }

    return true;
};


const authenticatedUserHasAccessToTheChat = async (message_img_id:Types.ObjectId, user:User) => {
    if (user.is_admin) {
        return true;
    }

    const message_img = await MessagesImgs.findById(message_img_id);
    // @ts-ignore
    const chat_message = await ChatMessages.findById(message_img.message_id);
    // @ts-ignore
    await checkUserParticipateInChat(user._id, chat_message.chat_id);
};
