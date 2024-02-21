import request from "supertest";
import app from "../app";

import { mockUserTaylor, mockUserLayla, } from "./consts/mocks";
import { createUsers } from "./helpers/createUsers";
import { createChat } from "./helpers/createChat";
import { createMessage } from "./helpers/createMessage";

describe("MessageSeenBy API Tests", () => {
    const usersIds:string[] = [];

    let chatId:string;
    let messageId:string;
    let messageSeenById:string;

    beforeAll( async () => {
        const createdUsers = await createUsers([mockUserTaylor, mockUserLayla]);

        usersIds.push(...createdUsers);

        chatId = await createChat(usersIds);

        messageId = await createMessage(chatId, usersIds[0]!, 'Hello Layla!');
    });

    afterAll(async () => {
        if (usersIds.length) {
            await Promise.all(usersIds.map( async (userId) => {
                await request(app).del(`/api/users/${userId}`);
            }))
        }
        if(chatId){
            await request(app).del(`/api/chats/${chatId}`);
        }
        if(messageId){
            await request(app).del(`/api/chat-messages/${messageId}`);
        }
    });

    describe("POST /api/message-seen-by", () => {
        it("Validation fails for a no user", async() => {
            const res = await request(app).post("/api/message-seen-by").send({ message_id:messageId });
            expect(res.statusCode).toBe(400);
        });
        it("Validation fails for a no message", async() => {
            const res = await request(app).post("/api/message-seen-by").send({ user_id:usersIds[0] });
            expect(res.statusCode).toBe(400);
        });
        it("Creates an entity", async() => {
            const res = await request(app).post("/api/message-seen-by").send({ user_id:usersIds[1], message_id:messageId });
            expect(res.statusCode).toBe(200);
            expect(res.body.user_id).toEqual(usersIds[1]);
            messageSeenById=res.body._id;
        });
        it("Validation fails for existed entity", async() => {
            const res = await request(app).post("/api/message-seen-by").send({ user_id:usersIds[1], message_id:messageId });
            expect(res.statusCode).toBe(400);
        });
    });

    describe("GET /api/message-seen-by", () => {
        it("Return message-seen-by", async() => {
            const res = await request(app).get(`/api/message-seen-by/?message_id=${messageId}`);
            expect(res.statusCode).toBe(200);
            expect(res.body.length).toBeGreaterThan(0);
        });
    })


    describe("DEL /api/message-seen-by", () => {
        it("Deletes message-seen-by", async() => {
            await request(app).del(`/api/message-seen-by/${messageSeenById}`).expect(200);
        })
    })
})




