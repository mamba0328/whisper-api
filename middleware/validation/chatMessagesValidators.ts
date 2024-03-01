import { body, param, query } from "express-validator";

import { Chats } from "../../models/Chats";
import { Users } from "../../models/Users";
import { ChatMessages } from "../../models/ChatMessages";

import { checkEntityExistsInDataBaseById } from "../../helpers/checkEntityExistsInDB";

import { Error, User } from "../../types/types";
import { Types } from "mongoose";

export const getValidators = [
    query("skip").isNumeric().optional(),
    query("limit").isNumeric().optional(),
    query("chat_id").isMongoId().custom(async (chat_id:string) => checkEntityExistsInDataBaseById(chat_id, Chats)).bail({ level: "request" }),
    query("chat_id").custom(async (chat_id:string, { req }) => authenticatedUserHasAccessToTheChat(chat_id, req.user as User)).bail({ level: "request" })
];
export const postValidators = [
    body("chat_id").isMongoId().custom(async (id:string) => checkEntityExistsInDataBaseById(id, Chats)).bail({ level: "request" }),
    body("chat_id").custom(async (chat_id:string, { req }) => authenticatedUserHasAccessToTheChat(chat_id, req.user as User)).bail({ level: "request" }),
    body("user_id").isMongoId().custom(async (id:string) => checkEntityExistsInDataBaseById(id, Users)).bail({ level: "request" }),
    body("user_id").isMongoId().custom(async (id:string, { req }) => checkUserParticipateInChat(id, req.body.chat_id as string)).bail({ level: "request" }),
    body("user_id").isMongoId().custom((id:string, { req }) => authenticatedUserMatchesOneInNewMessage(id, req.user._id as Types.ObjectId)).bail({ level: "request" }),
    body("body").isString().trim().isLength({ min: 1, max: 3000 }).if(body("message_img").exists()).optional()
];
export const putValidators = [
    param("id").isMongoId().custom(async (id:string) => await checkEntityExistsInDataBaseById(id, ChatMessages)).bail({ level: "request" }),
    param("id").custom(async (id:string, { req }) => await authenticatedUserHasAccessToTheMessage(id, req.user as User)).bail({ level: "request" }),
    body("body").isString().trim().isLength({ min: 1, max: 3000 }).if(body("message_img").exists()).optional()
];
export const deleteValidators = [
    param("id").isMongoId().custom(async (id:string) => await checkEntityExistsInDataBaseById(id, ChatMessages)).bail({ level: "request" }),
    param("id").custom(async (id:string, { req }) => await authenticatedUserHasAccessToTheMessage(id, req.user as User))
];


const checkUserParticipateInChat = async (user_id:string, chat_id:string) => {
    const chat = await Chats.findById(chat_id);

    // @ts-ignore
    if (!chat!.chat_users.includes(user_id)) {
        const error:Error = new Error("Such user don't participate in the chat");
        error.status = 400;
        throw error;
    }

    return true;
};

const authenticatedUserHasAccessToTheMessage = async (message_id:string, user:User) => {
    if (user.is_admin) {
        return true;
    }

    const message = await ChatMessages.findById(message_id);

    if (user._id !== message!.user_id) {
        const error:Error = new Error("User doesnt have access to make this action");
        error.status = 400;
        throw error;
    }

    return true;
};

const authenticatedUserHasAccessToTheChat = async (chat_id:string, user:User) => {
    if (user.is_admin) {
        return true;
    }

    const chat = await Chats.findById(chat_id);

    if (!chat!.chat_users.includes(user._id)) {
        const error:Error = new Error("User doesnt have access to make this action");
        error.status = 400;
        throw error;
    }

    return true;
};

const authenticatedUserMatchesOneInNewMessage = (userInMessage:string, userInRequest:Types.ObjectId) => {
    if (userInMessage.toString() !== userInRequest.toString()) {
        const error:Error = new Error("You can't create message for someone else");
        error.status = 400;
        throw error;
    }

    return true;
};
