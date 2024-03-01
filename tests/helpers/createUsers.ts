import { Types } from "mongoose";
import bcrypt from "bcryptjs";

import { Users } from "../../models/Users";
import { User, UserPayload } from "../../types/types";

export const createUsers = async (users: UserPayload[]):Promise<Types.ObjectId[]> => {
    try {
        const usersIds:Types.ObjectId[] = [];
        await Promise.all(users.map(async (mockUser) => {
            mockUser.password = await bcrypt.hash(mockUser.password, 10);

            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            const user = await Users.create(mockUser);

            usersIds.push(user._id);
        }));

        return usersIds;
    } catch (error) {
        console.log(error);
        return [];
    }
};
