// @ts-ignore
import session from "supertest-session";
import app from "../app";
import { mockAdmin } from "./consts/mocks";


describe("MessageSeenBy API Tests", () => {
    const testSession = session(app);

    let usersId:string;
    let messageId:string;
    let messageSeenById:string;

    beforeAll( async () => {
        await testSession.post("/sign-in").send({ identity_field: mockAdmin.username, password: mockAdmin.password });

        const { body:userResponse } = await testSession.get("/api/users/?username=admin");
        usersId = userResponse[0]._id;

        const { body:chatResponse } = await testSession.get(`/api/chats/?chat_users=${usersId}`);
        const chatId = chatResponse[0]._id;

        const { body:messageResponse } = await testSession.get(`/api/chat-messages/?chat_id=${chatId}`);
        messageId = messageResponse[0]._id;
    });

    afterAll(async () => {
        await testSession.post("/sign-out").send()
    });

    describe("POST /api/message-seen-by", () => {
        it("Validation fails for a no user", async() => {
            const res = await testSession.post("/api/message-seen-by").send({ message_id:messageId });
            expect(res.statusCode).toBe(400);
        });
        it("Validation fails for a no message", async() => {
            const res = await testSession.post("/api/message-seen-by").send({ user_id:usersId });
            expect(res.statusCode).toBe(400);
        });
        it("Creates an entity", async() => {
            const res = await testSession.post("/api/message-seen-by").send({ user_id:usersId, message_id:messageId });
            console.log(res.body)
            expect(res.statusCode).toBe(200);
            expect(res.body.user_id).toEqual(usersId);
            messageSeenById=res.body._id;
        });
        it("Validation fails for existed entity", async() => {
            const res = await testSession.post("/api/message-seen-by").send({ user_id:usersId, message_id:messageId });
            expect(res.statusCode).toBe(400);
        });
    });

    describe("GET /api/message-seen-by", () => {
        it("Return message-seen-by", async() => {
            const res = await testSession.get(`/api/message-seen-by/?message_id=${messageId}`);
            expect(res.statusCode).toBe(200);
            expect(res.body.length).toBeGreaterThan(0);
        });
    })


    describe("DEL /api/message-seen-by", () => {
        it("Deletes message-seen-by", async() => {
            await testSession.delete(`/api/message-seen-by/${messageSeenById}`).expect(200);
        })
    })
})




