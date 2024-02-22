import { body, param, query } from "express-validator";
import { checkEntityExistsInDataBaseById } from "../../helpers/checkEntityExistsInDB";
import { Error } from "../../types/types";
import { UserContacts } from "../../models/UserContacts";
import { Users } from "../../models/Users";

export const getValidators = [
    query("skip").isNumeric().optional(),
    query("limit").isNumeric().optional(),
    query("username").isString().optional(),
    query("contact").isString().optional()
];
export const postValidators = [
    body("user_id").isMongoId().custom(async (id:string) => await checkEntityExistsInDataBaseById(id, Users)).bail({ level: "request" }),
    body("contact_id").isMongoId().custom(async (id:string) => await checkEntityExistsInDataBaseById(id, Users)).bail({ level: "request" }),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    body("user_id").custom(async (user_id:string, { req }) => await checkContactAlreadyExists(user_id, req.body.contact_id))
];
export const deleteValidators = [
    param("id").isMongoId().custom(async (id:string) => await checkEntityExistsInDataBaseById(id, UserContacts))
];


const checkContactAlreadyExists = async (user_id:string, contact_id:string) => {
    const contactAlreadyExists = await UserContacts.findOne({ user_id, contact_id });

    if (contactAlreadyExists) {
        const error:Error = new Error("Contact already exists");
        error.status = 400;

        throw error;
    }
};
