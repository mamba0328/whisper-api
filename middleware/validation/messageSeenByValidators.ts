import { body, param, query } from "express-validator";
import { checkEntityExistsInDataBaseById } from "../../helpers/checkEntityExistsInDB";
import { Users } from "../../models/Users";
import { Error } from "../../types/types";
import { ChatMessages } from "../../models/ChatMessages";
import { MessageSeenBy } from "../../models/MessageSeenBy";

export const getValidators = [
    query("skip").isNumeric().optional(),
    query("limit").isNumeric().optional(),
    query("user_id").optional().isMongoId().custom(async (id:string) => checkEntityExistsInDataBaseById(id, Users)),
    query("message_id").isMongoId().custom(async (id:string) => checkEntityExistsInDataBaseById(id, ChatMessages))
];
export const postValidators = [
    body("user_id").isMongoId().custom(async (id:string) => checkEntityExistsInDataBaseById(id, Users)).bail({ level: "request" }),
    body("message_id").isMongoId().custom(async (id:string) => checkEntityExistsInDataBaseById(id, ChatMessages)).bail({ level: "request" }),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    body("message_id").custom(async (message_id:string, { req }) => checkThatMessageAlreadySeenByTheUser(req.body.user_id, message_id))
];
export const deleteValidators = [
    param("id").isMongoId().custom(async (id:string) => await checkEntityExistsInDataBaseById(id, MessageSeenBy))
];


const checkThatMessageAlreadySeenByTheUser = async (user_id:string, message_id:string) => {
    const messageAlreadySeenByTheUser = await MessageSeenBy.findOne({ user_id, message_id });
    if (messageAlreadySeenByTheUser) {
        const error: Error = new Error("User already seen the message");
        error.status = 400;

        throw error;
    }
};
