// @ts-ignore
import session from "supertest-session";
import { Types } from "mongoose";
import app from "../app";


import { Chat, MessagePayload } from "../types/types";
import { mockAdmin } from "./consts/mocks";

describe("ChatMessages API Tests", () => {
    const testSession = session(app);

    let chatId:Types.ObjectId;
    let groupChatId:Types.ObjectId;
    const chatPayload:MessagePayload = { body:"Message", user_id: null, chat_id: null, }

    let messageId:Types.ObjectId;
    let groupChatMessageId:Types.ObjectId;

    beforeAll(async () => {
        await testSession.post("/sign-in").send({ identity_field: mockAdmin.username, password: mockAdmin.password });

        const {body:userResponse} = await testSession.get("/api/users/?username=admin");
        const user_id = userResponse[0]._id;

        const {body:chatResponse}  = await testSession.get(`/api/chats/?chat_users=${user_id}`)

        groupChatId = chatResponse.find((chat:Chat) => chat.is_group_chat)._id;
        chatId = chatResponse.find((chat:Chat) => !chat.is_group_chat)._id;

        chatPayload.user_id = user_id;
        chatPayload.chat_id = chatId;
    })

    afterAll(async () => {
        await testSession.post("/sign-out").send()
    })

    describe("POST /api/chat-messages", () => {
        it("Validation fails for a blank message", async() => {
            const res = await testSession.post("/api/chat-messages").send({...chatPayload, body: '   '});
            expect(res.statusCode).toBe(400);
        });
        it("Validation fails for a bad user", async() => {
            const res = await testSession.post("/api/chat-messages").send({...chatPayload, user_id: `${chatPayload.user_id}`.slice(0, -2) + '1'});
            expect(res.statusCode).toBe(400);
        });
        it("Validation fails for a bad chat", async() => {
            const res = await testSession.post("/api/chat-messages").send({...chatPayload, chat_id: `${chatPayload.chat_id}`.slice(0, -2) + '1'});
            expect(res.statusCode).toBe(400);
        });
        it("Creates message in personal-chat", async() => {
            const res = await testSession.post("/api/chat-messages").send(chatPayload);
            expect(res.statusCode).toBe(200);
            expect(res.body.body).toEqual(chatPayload.body);
            messageId = res.body._id;
        })
        it("Creates message in group-chat", async() => {
            const res = await testSession.post("/api/chat-messages").send({...chatPayload, chat_id: groupChatId});
            groupChatMessageId = res.body._id;
            expect(res.statusCode).toBe(200);
            expect(res.body.body).toEqual(chatPayload.body);
        })
    });

    describe("GET /api/chat-messages", () => {
        it("Return chat messages", async() => {
            const res = await testSession.get(`/api/chat-messages/?chat_id=${chatId}`);
            expect(res.statusCode).toBe(200);
            expect(res.body.length).toBeGreaterThan(0);
        });
        it("Return group-chat messages", async() => {
            const res = await testSession.get(`/api/chat-messages/?chat_id=${groupChatId}`);
            expect(res.statusCode).toBe(200);
            expect(res.body.length).toBeGreaterThan(0);
        });
    })

    describe("PUT /api/chat-messages", () => {
        it("Edit chat messages", async() => {
            const res = await testSession.put(`/api/chat-messages/${messageId}`).send({body: "new body"});
            expect(res.statusCode).toBe(200);
            expect(res.body.body).toEqual("new body");
        });
        it("Edit group-chat messages", async() => {
            const res = await testSession.put(`/api/chat-messages/${groupChatMessageId}`).send({body: "new body"});
            expect(res.statusCode).toBe(200);
            expect(res.body.body).toEqual("new body");
        });
    })

    describe("DEL /api/chat-messages", () => {
        it("Deletes message", async() => {
            await testSession.delete(`/api/chat-messages/${messageId}`).expect(200);
        })
        it("Deletes group-chat message", async() => {
            await testSession.delete(`/api/chat-messages/${groupChatMessageId}`).expect(200);
        })
        // it("No chat messages left", async() => {
        //     await testSession.del(`/api/user-contacts/${contactId}`).expect(200);
        // })
    })
})




