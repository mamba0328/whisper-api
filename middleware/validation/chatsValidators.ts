import { body, param, query } from "express-validator";
import { checkEntityExistsInDataBaseById } from "../../helpers/checkEntityExistsInDB";
import { Chats } from "../../models/Chats";
import { Users } from "../../models/Users";
import { Error } from "../../types/types";

export const getValidators = [
    query("skip").isNumeric().optional(),
    query("limit").isNumeric().optional(),
    query("chat_users").isString().optional(),
    query("chat_name").isString().optional(),
    query("is_group_chat").isString().optional()
];
export const postValidators = [
    body("is_group_chat").optional().isBoolean(),
    body("chat_name").optional().isString().escape(),
    body("chat_users.*").isMongoId().bail({ level: "request" }),
    body("chat_users").if(body("is_group_chat").not().exists()).isArray({ min: 2, max: 2 }),
    body("chat_users").isArray().custom(async (chat_users) => {
        if (!chat_users.length) {
            throw new Error("No empty chat_users");
        }
        await Promise.all([chat_users.map(async (id:string) => await checkEntityExistsInDataBaseById(id, Users))]);
    }).bail({ level: "request" }),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    body("chat_users").custom(async (chat_users:string[], { req }) => await checkPersonalChatAlreadyExists(chat_users, req.body.is_group_chat))

];
export const putValidators = [
    param("id").isMongoId().custom(async (id:string) => {
        await checkEntityExistsInDataBaseById(id, Chats);
        const chat = await Chats.findById(id);
        if (!chat!.is_group_chat) {
            throw new Error("Chat is not editable");
        }
    }),
    body("chat_name").optional().isString().escape(),
    body("chat_users").optional().isArray().custom(async (chat_users) => {
        await Promise.all([chat_users.map(async (id:string) => await checkEntityExistsInDataBaseById(id, Users))]);
    })
];
export const deleteValidators = [
    param("id").isMongoId().custom(async (id:string) => await checkEntityExistsInDataBaseById(id, Chats))
];


const checkPersonalChatAlreadyExists = async (chat_users:string[], is_group_chat:boolean) => {
    if (is_group_chat) {
        return true;
    }
    const chatAlreadyExists = await Chats.findOne({ chat_users: { $all: chat_users }, is_group_chat: false });
    if (chatAlreadyExists) {
        const error: Error = new Error("Chat already exists");
        error.status = 400;
        throw error;
    }
};
