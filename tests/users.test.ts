// @ts-ignore
import session from "supertest-session";
import app from "../app";
import { mockAdmin, mockNewUser } from "./consts/mocks";
import { Types } from "mongoose"
import { createChat } from "./helpers/createChat";

describe("User API Tests", () => {
    const testSession = session(app);

    let createdUserId: Types.ObjectId;
    let chatId: Types.ObjectId;

    beforeAll( async () => {
        await testSession.post("/sign-in").send({ identity_field: mockAdmin.username, password: mockAdmin.password });

        const createUserResponse = await testSession.post("/api/users").send(mockNewUser);

        createdUserId = createUserResponse.body._id as Types.ObjectId;
        chatId = await createChat({chat_users:[createdUserId], is_group_chat:true});
    });

    afterAll(async () => {
        await testSession.post("/sign-out").send();
    });

    describe("POST /api/users", () => {
        it("Validation fails for an non-unique user", async() => {
            const res = await testSession.post("/api/users").send(mockNewUser);
            expect(res.statusCode).toBe(400);
        });
    });

    describe("GET /api/users", () => {
        it("Returns users", async () => {
            const getUserResponse = await testSession.get("/api/users");
            expect(getUserResponse.body.length).toBeGreaterThan(0);
        });
    });

    describe("PUT /api/users", () => {
        it("Update user", async() => {
            const res = await testSession.put(`/api/users/${createdUserId}`).send({
                first_name: 'Layla',
            });
            expect(res.body.first_name).toBe('Layla');
        })
    })

    describe("PUT /api/users/writes-in-chat", () => {
        it("Update users writes_in_chat value to chatId", async() => {
            const res = await testSession.put(`/api/users/writes-in-chat/${createdUserId}`).send({
                chat_id: chatId,
            });
            expect(res.body.writes_in_chat).toBe(chatId.toString());
        })
        it("Update users writes_in_chat value to null", async() => {
            const res = await testSession.put(`/api/users/writes-in-chat/${createdUserId}`).send({
                chat_id: null,
            });
            expect(res.body.writes_in_chat).toBe(null);
        })
    })

    describe("DEL /api/users", () => {
        it("Delete user", async() => {
            await testSession.delete(`/api/users/${createdUserId}`).expect(200);
        })
    })
})




