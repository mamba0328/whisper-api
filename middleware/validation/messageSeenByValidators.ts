import { body, param, query } from "express-validator";
import { Types } from "mongoose";
import { checkEntityExistsInDataBaseById } from "../../helpers/checkEntityExistsInDB";
import { Users } from "../../models/Users";
import { Error, User } from "../../types/types";
import { ChatMessages } from "../../models/ChatMessages";
import { MessageSeenBy } from "../../models/MessageSeenBy";

export const getValidators = [
    query("skip").isNumeric().optional(),
    query("limit").isNumeric().optional(),
    query("user_id").optional().isMongoId().custom(async (id:Types.ObjectId) => await checkEntityExistsInDataBaseById(id, Users)),
    query("message_id").isMongoId().custom(async (id:Types.ObjectId) => await checkEntityExistsInDataBaseById(id, ChatMessages)),
    query("user_id").custom((id:Types.ObjectId, { req }) => authUserIsAdmin(req.user as User))
];
export const postValidators = [
    body("user_id").isMongoId().custom(async (id:Types.ObjectId) => checkEntityExistsInDataBaseById(id, Users)).bail({ level: "request" }),
    body("user_id").custom((id:string, { req }) => userInRequestMatchesAuthUser(id, req.user as User)).bail({ level: "request" }),
    body("message_id").isMongoId().custom(async (id:Types.ObjectId) => checkEntityExistsInDataBaseById(id, ChatMessages)).bail({ level: "request" }),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    body("message_id").custom(async (message_id:Types.ObjectId, { req }) => checkThatMessageAlreadySeenByTheUser(req.body.user_id, message_id))
];
export const deleteValidators = [
    param("id").isMongoId().custom(async (id:Types.ObjectId) => await checkEntityExistsInDataBaseById(id, MessageSeenBy)),
    param("id").custom((id:Types.ObjectId, { req }) => authUserIsAdmin(req.user as User))
];

const checkThatMessageAlreadySeenByTheUser = async (user_id:Types.ObjectId, message_id:Types.ObjectId) => {
    const messageAlreadySeenByTheUser = await MessageSeenBy.findOne({ user_id, message_id });
    if (messageAlreadySeenByTheUser) {
        const error: Error = new Error("User already seen the message");
        error.status = 400;

        throw error;
    }
};

const authUserIsAdmin = (user:User) => {
    if (user.is_admin) {
        return true;
    }

    const error:Error = new Error("You have no right for the action");
    error.status = 401;
    throw error;
};

const userInRequestMatchesAuthUser = (user_id:string, user:User) => {
    if (user.is_admin) {
        return true;
    }

    if (user_id === user._id.toString()) {
        return true;
    }

    const error:Error = new Error("You have no right for the action");
    error.status = 401;
    throw error;
};
