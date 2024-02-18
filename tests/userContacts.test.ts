import request from "supertest";
import app from "../app";

import { mockUserTaylor, mockUserLayla } from "./consts/mocks";
import { createUsers } from "./helpers/createUsers";
import { findAndDeleteInstance } from "./helpers/findAndDeleteInstance";


describe("UserContacts API Tests", () => {
    const usersIds:string[] = [];
    let contactId:string;

    beforeAll( async () => {
        //create users, so we can then create contact with them
        const createdUsersIds:string[] = await createUsers([mockUserTaylor, mockUserLayla]);
        usersIds.push(...createdUsersIds);

        //create contact
        const contactPayload = {user_id: usersIds[0]!, contact_id: usersIds[1]!};
        const reqUserContact = await request(app).post("/api/user-contacts").send(contactPayload);

        if(reqUserContact.statusCode !== 200){ //usually bad response if contact already exists, so we'll delete it
            await findAndDeleteInstance("user-contacts", contactPayload)
            const reqUserContact = await request(app).post("/api/user-contacts").send(contactPayload);
            return contactId = reqUserContact.body._id;
        }

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




