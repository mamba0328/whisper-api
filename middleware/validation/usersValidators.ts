import { body, param, query } from "express-validator";
import { checkEntityExistsInDataBaseById } from "../../helpers/checkEntityExistsInDB";
import { Chats } from "../../models/Chats";
import { Users } from "../../models/Users";
import { Error } from "../../types/types";
import { validateImage } from "./fileValidation";

const fiveMegaBytes = 5 * 10 ** 6;
export const getValidators = [
    query("skip").isNumeric().optional(),
    query("limit").isNumeric().optional(),
    query("first_name").isString().optional(),
    query("last_name").isString().optional(),
    query("username").isString().optional(),
    query("phone_number").isString().optional(),
    query("email").isString().optional()
];
export const postValidators = [
    body("first_name").isString().trim().isLength({ min: 1, max: 100 }).escape(),
    body("last_name").isString().trim().isLength({ min: 1, max: 100 }).escape(),
    body("username").isString().trim().isLength({ min: 1, max: 100 }).escape().bail({ level: "request" }),
    body("date_of_birth").optional().isDate({ format: "YYYY-MM-DD" }),
    body("phone_number").isString().trim().isLength({ min: 6, max: 12 }).bail({ level: "request" }),
    body("email").isString().trim().isLength({ min: 4, max: 100 }).bail({ level: "request" }),
    body("password").isString().isLength({ min: 8, max: 100 }).bail({ level: "request" }),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    body("username").custom(async (username:string, { req }) => await checkUniquenessOfTheUserData(username, req.body.phone_number, req.body.email)),
    validateImage("user_profile_img", fiveMegaBytes)
];
export const putValidators = [
    param("id").isMongoId().custom(async (id:string) => await checkEntityExistsInDataBaseById(id, Users)),
    body("first_name").optional().isString().isLength({ min: 1, max: 100 }).escape(),
    body("last_name").optional().isString().isLength({ min: 1, max: 100 }).escape(),
    body("username").optional().isString().isLength({ min: 1, max: 100 }).escape(),
    body("date_of_birth").optional().isDate(),
    body("user_img").optional(),
    validateImage("user_profile_img", fiveMegaBytes)
];
export const deleteValidators = [
    param("id").isMongoId().custom(async (id:string) => await checkEntityExistsInDataBaseById(id, Users))
];

export const writesInChatValidators = [
    param("id").isMongoId().custom(async (id:string) => await checkEntityExistsInDataBaseById(id, Users)),
    body("chat_id").optional({ nullable: true }).if(body("chat_id").isMongoId()).custom(async (id:string) => await checkEntityExistsInDataBaseById(id, Chats))
];

const checkUniquenessOfTheUserData = async (username:string, phone_number:string, email:string) => {
    const userWithUniqueDataAlreadyExists = await Users.findOne({ $or: [{ "username": username }, { "phone_number": phone_number }, { "email": email }] });

    if (userWithUniqueDataAlreadyExists) {
        const error:Error = new Error("User with such data already exists");
        error.status = 400;

        throw error;
    }
};
