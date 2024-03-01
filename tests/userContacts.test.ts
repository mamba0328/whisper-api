// @ts-ignore
import session from "supertest-session";
import app from "../app";

import {mockUserTaylor, mockUserLayla, mockAdmin} from "./consts/mocks";
import { createUsers } from "./helpers/createUsers";
import { findAndDeleteInstance } from "./helpers/findAndDeleteInstance";


describe("UserContacts API Tests", () => {
    const testSession = session(app);

    const usersIds:string[] = [];
    let contactId:string;

    beforeAll( async () => {
        await testSession.post("/sign-in").send({ identity_field: mockAdmin.username, password: mockAdmin.password });

        const { body:userResponse } = await testSession.get("/api/users");
        usersIds.push(userResponse[0]._id, userResponse[1]._id)
    });

    afterAll(async () => {
        await testSession.post("/sign-out").send()
    });

    describe("POST /api/user-contacts", () => {
        it("Creates contact", async() => {
            const res = await testSession.post("/api/user-contacts").send({user_id: usersIds[0], contact_id: usersIds[1]});
            contactId = res.body._id;
            expect(res.statusCode).toBe(200);
        });
        it("Validation fails for an non-unique contact", async() => {
            const res = await testSession.post("/api/user-contacts").send({user_id: usersIds[0], contact_id: usersIds[1]});
            expect(res.statusCode).toBe(400);
        });
    });

    describe("GET /api/user-contacts", () => {
        it("Returns user contacts", async () => {
            const getUserResponse = await testSession.get("/api/user-contacts");
            expect(getUserResponse.body.length).toBeGreaterThan(0);
            expect(getUserResponse.body[0].user_id).toEqual(usersIds[0]);
            expect(getUserResponse.body[0].contact_id).toEqual(usersIds[1]);
        });
    });

    describe("DEL /api/user-contacts", () => {
        it("Delete user contact", async() => {
            await testSession.delete(`/api/user-contacts/${contactId}`).expect(200);
        })
    })
})




