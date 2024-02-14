import request from "supertest";
import app from "../app";

import { mockUserTaylor, mockUserLayla } from "./consts/mocks";
import { findAndDeleteUser } from "./helpers/findAndDeleteUser";


describe("User API Tests", () => {
    const usersIds:string[] = [];
    let contactId:string;

    beforeAll( async () => {
        const mockUsers = [mockUserTaylor, mockUserLayla];

        await Promise.all(mockUsers.map(async (mockUser) => {
            const createUserResponse = await request(app).post("/api/users").send(mockUser);

            if(createUserResponse.statusCode === 400){
                await findAndDeleteUser(mockUser.username);
                const createUserResponse = await request(app).post("/api/users").send(mockUser);
                usersIds.push(createUserResponse.body._id);
            }

            usersIds.push(createUserResponse.body._id);
        }))

        const reqUserContact = await request(app).post("/api/user-contacts").send({user_id: usersIds[0], contact_id: usersIds[1]});

        contactId = reqUserContact.body._id;
    });

    afterAll(async () => {
        if (usersIds.length) {
            await Promise.all(usersIds.map( async (userId) => {
                await request(app).del(`/api/users/${userId}`);
            }))
        }
        if(contactId){
            await request(app).del(`/api/user-contacts/${contactId}`);
        }
    });

    describe("POST /api/user-contacts", () => {
        it("Validation fails for an non-unique contact", async() => {
            const res = await request(app).post("/api/user-contacts").send({user_id: usersIds[0], contact_id: usersIds[1]});
            expect(res.statusCode).toBe(400);
        });
    });

    describe("GET /api/user-contacts", () => {
        it("Returns user contacts", async () => {
            const getUserResponse = await request(app).get("/api/user-contacts");
            expect(getUserResponse.body.length).toBeGreaterThan(0);
            expect(getUserResponse.body[0].user_id).toEqual(usersIds[0]);
            expect(getUserResponse.body[0].contact_id).toEqual(usersIds[1]);
        });
    });

    describe("DEL /api/user-contacts", () => {
        it("Delete user contact", async() => {
            await request(app).del(`/api/user-contacts/${contactId}`).expect(200);
        })
    })
})




