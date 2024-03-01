import { body, param, query } from "express-validator";
import { checkEntityExistsInDataBaseById } from "../../helpers/checkEntityExistsInDB";
import { Error, User } from "../../types/types";
import { UserContacts } from "../../models/UserContacts";
import { Users } from "../../models/Users";
import { Types } from "mongoose";

export const getValidators = [
    query("skip").isNumeric().optional(),
    query("limit").isNumeric().optional(),
    query("username").isString().optional(),
    query("contact").isString().optional(),
    query("username").custom((username:string, { req }) => usernameInRequestMatchesAuthUser(username, req.user as User))
];
export const postValidators = [
    body("user_id").isMongoId().custom(async (id:Types.ObjectId) => await checkEntityExistsInDataBaseById(id, Users)).bail({ level: "request" }),
    body("contact_id").isMongoId().custom(async (id:Types.ObjectId) => await checkEntityExistsInDataBaseById(id, Users)).bail({ level: "request" }),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    body("user_id").custom(async (user_id:Types.ObjectId, { req }) => await checkContactAlreadyExists(user_id, req.body.contact_id)),
    body("user_id").custom((user_id:string, { req }) => userIdInRequestMatchesAuthUser(user_id, req.user as User))
];
export const deleteValidators = [
    param("id").isMongoId().custom(async (id:Types.ObjectId) => await checkEntityExistsInDataBaseById(id, UserContacts)),
    param("id").custom(async (id:Types.ObjectId, { req }) => await authUserParticipateInContact(id, req.user as User))
];


const checkContactAlreadyExists = async (user_id:Types.ObjectId, contact_id:Types.ObjectId) => {
    const contactAlreadyExists = await UserContacts.findOne({ user_id, contact_id });

    if (contactAlreadyExists) {
        const error:Error = new Error("Contact already exists");
        error.status = 400;

        throw error;
    }
};

const usernameInRequestMatchesAuthUser = (username:string, user:User) => {
    if (user.is_admin) {
        return true;
    }

    if (username === user.username) {
        return true;
    }

    const error:Error = new Error("You have no right for the action");
    error.status = 401;
    throw error;
};

const userIdInRequestMatchesAuthUser = (user_id:string, user:User) => {
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


const authUserParticipateInContact = async (contact_id:Types.ObjectId, user:User) => {
    if (user.is_admin) {
        return true;
    }

    const contact = await UserContacts.findById(contact_id);

    if (contact!.user_id !== user._id) {
        const error:Error = new Error("You can't delete someone-else's contact");
        error.status = 401;
        throw error;
    }
};

