import { body, param, query } from "express-validator";
import { Types } from "mongoose";

import { checkEntityExistsInDataBaseById } from "../../helpers/checkEntityExistsInDB";
import { Chats } from "../../models/Chats";
import { Users } from "../../models/Users";
import { Error, User } from "../../types/types";

export const getValidators = [
    query("skip").isNumeric().optional(),
    query("limit").isNumeric().optional(),
    query("chat_users").isString(),
    query("chat_name").isString().optional(),
    query("is_group_chat").isString().optional(),
    query("chat_users").custom((chat_users:string[], { req }) => authenticatedUserAmongChatUsers(chat_users, req.user as User))
];
export const postValidators = [
    body("is_group_chat").optional().isBoolean(),
    body("chat_name").optional().isString().escape(),
    body("chat_users.*").isMongoId().bail({ level: "request" }),
    body("chat_users").if(body("is_group_chat").not().exists()).isArray({ min: 2, max: 2 }),
    body("chat_users").isArray().custom(async (chat_users:Types.ObjectId[]) => allChatUsersAreValid(chat_users)).bail({ level: "request" }),
    body("chat_users").custom((chat_users:string[], { req }) => authenticatedUserAmongChatUsers(chat_users, req.user as User)),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    body("chat_users").custom(async (chat_users:Types.ObjectId[], { req }) => await checkPersonalChatAlreadyExists(chat_users, req.body.is_group_chat))

];
export const putValidators = [
    param("id").isMongoId().custom(async (id:Types.ObjectId) => await checkEntityExistsInDataBaseById(id, Chats)).bail({ level: "request" }),
    param("id").isMongoId().custom(async (id:Types.ObjectId) => await chatIsEditable(id)).bail({ level: "request" }),
    param("id").isMongoId().custom(async (chat_id:Types.ObjectId, { req }) => await authUserHasAccessToTheChatByChatId(chat_id, req.user as User)),
    body("chat_name").optional().isString().escape(),
    body("chat_users").optional().isArray().custom(async (chat_users) => {
        await Promise.all([chat_users.map(async (id:Types.ObjectId) => await checkEntityExistsInDataBaseById(id, Users))]);
    })
];
export const deleteValidators = [
    param("id").isMongoId().custom(async (id:Types.ObjectId) => await checkEntityExistsInDataBaseById(id, Chats)).bail({ level: "request" }),
    param("id").isMongoId().custom(async (chat_id:Types.ObjectId, { req }) => await authUserHasAccessToTheChatByChatId(chat_id, req.user as User))
];

const allChatUsersAreValid = async (chat_users:Types.ObjectId[]) => {
    if (!chat_users.length) {
        throw new Error("No empty chat_users");
    }
    await Promise.all([chat_users.map(async (id:Types.ObjectId) => await checkEntityExistsInDataBaseById(id, Users))]);

    return true;
};

const checkPersonalChatAlreadyExists = async (chat_users:Types.ObjectId[], is_group_chat:boolean) => {
    if (is_group_chat) {
        return true;
    }
    const chatAlreadyExists = await Chats.findOne({ chat_users: { $all: chat_users }, is_group_chat: false });
    if (chatAlreadyExists) {
        const error: Error = new Error("Chat already exists");
        error.status = 400;
        throw error;
    }

    return true;
};

const authenticatedUserAmongChatUsers = (chat_users:string[], user:User) => {
    if (user.is_admin) {
        return true;
    }

    if (!chat_users.includes(user._id.toString())) {
        const error: Error = new Error("User has access only to the chats that he participates in");
        error.status = 400;
        throw error;
    }

    return true;
};

const authUserHasAccessToTheChatByChatId = async (chat_id:Types.ObjectId, user:User) => {
    const chat = await Chats.findById(chat_id);

    const authUserId = user._id;
    if (!chat!.chat_users.includes(authUserId)) {
        throw new Error("User has no access to the chat");
    }

    return true;
};

const chatIsEditable = async (chat_id:Types.ObjectId) => {
    const chat = await Chats.findById(chat_id);
    if (!chat!.is_group_chat) {
        throw new Error("Chat is not editable");
    }

    return true;
};
