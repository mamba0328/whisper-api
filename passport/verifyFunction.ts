import bcrypt from "bcryptjs";
import { Users } from "../models/Users";
import { USER_IDENTITY_FIELD_TYPES } from "../helpers/consts";
import { User } from "../types/types";

type DoneCallback = (err: unknown, verify?: false | User, failureMessage?:{message:string}) => void;
const getUserFindKeyByIdentityField = (identity_field:string) => {
    const { email, phone_number, username } = USER_IDENTITY_FIELD_TYPES;
    const emailRegexp = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const phoneNumberRegexp = /^\+?[0-9\s.-]+$/;

    return emailRegexp.test(identity_field)
        ? email
        : phoneNumberRegexp.test(identity_field)
            ? phone_number
            : username;
};

export const verifyFunction = async (identity_field:string, password:string, done:DoneCallback):Promise<void> => {
    try {
        const userFindKey = getUserFindKeyByIdentityField(identity_field);
        const user = await Users.findOne({ [userFindKey]: identity_field });

        if (!user) {
            return done(null, false, { message: `Incorrect ${userFindKey}` });
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return done(null, false, { message: "Incorrect password" });
        }

        // @ts-ignore
        return done(null, user);
    } catch (err) {
        return done(err);
    }
};

