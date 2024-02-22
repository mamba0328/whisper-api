import { body, param, query } from "express-validator";
import { checkEntityExistsInDataBaseById } from "../../helpers/checkEntityExistsInDB";
import { Chats } from "../../models/Chats";
import { Users } from "../../models/Users";
import { ChatMessages } from "../../models/ChatMessages";
import { Error } from "../../types/types";

export const getValidators = [
    query("skip").isNumeric().optional(),
    query("limit").isNumeric().optional(),
    query("chat_id").isMongoId().custom(async (id:string) => checkEntityExistsInDataBaseById(id, Chats))
];
export const postValidators = [
    body("chat_id").isMongoId().custom(async (id:string) => checkEntityExistsInDataBaseById(id, Chats)).bail({ level: "request" }),
    body("user_id").isMongoId().custom(async (id:string) => checkEntityExistsInDataBaseById(id, Users)).bail({ level: "request" }),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    body("user_id").isMongoId().custom(async (id:string, { req }) => checkUserParticipateInChat(id, req.body.chat_id)),
    body("body").isString().trim().isLength({ min: 1, max: 3000 })
    // body("img_url").isArray(), ?? img as a blob -> send to the hosting -> receive url?
];
export const putValidators = [
    param("id").isMongoId().custom(async (id:string) => await checkEntityExistsInDataBaseById(id, ChatMessages)),
    body("body").isString().trim().isLength({ min: 1, max: 3000 })
    // body("img_url").isArray(), ?? img as a blob -> send to the hosting -> receive url?
];
export const deleteValidators = [
    param("id").isMongoId().custom(async (id:string) => await checkEntityExistsInDataBaseById(id, ChatMessages))
];


const checkUserParticipateInChat = async (user_id:string, chat_id:string) => {
    const chat = await Chats.findById(chat_id);

    // @ts-ignore
    if (!chat!.chat_users.includes(user_id)) {
        const error:Error = new Error("Such user don't participate in the chat");
        error.status = 400;
        throw error;
    }
};
