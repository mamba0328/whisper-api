import request from "supertest";
import app from "../../app";
import { findAndDeleteInstance } from "./findAndDeleteInstance";
import { User } from "../../types/types";

type UserResponse = {
    body: User
    statusCode: number,
}

export const createUsers = async (users: User[]):Promise<string[]> => {
    try {
        const usersIds:string[] = [];
        await Promise.all(users.map(async (mockUser) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            const createUserResponse:UserResponse = await request(app).post("/api/users").send(mockUser);

            if (createUserResponse.statusCode === 400) {
                await findAndDeleteInstance("users", { username: mockUser.username });
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                const createUserResponse:UserResponse = await request(app).post("/api/users").send(mockUser);
                return usersIds.push(createUserResponse.body._id!);
            }

            usersIds.push(createUserResponse.body._id!);
        }));

        return usersIds;
    } catch (error) {
        console.log(error);
        return [];
    }
};
