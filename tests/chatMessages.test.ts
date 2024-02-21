import request from "supertest";
import app from "../app";

import { mockUserTaylor, mockUserLayla, mockUserJohn, } from "./consts/mocks";
import { createUsers } from "./helpers/createUsers";
import { createChat } from "./helpers/createChat";

import { Message } from "../types/types";

describe("ChatMessages API Tests", () => {
    const usersIds:string[] = [];
    const personalChatUsers:string[] = [];
    let chatPayload:Message;

    let chatId:string;
    let groupChatId:string;

    let messageId:string;
    let groupChatMessageId:string;

    beforeAll( async () => {
        const createdUsers = await createUsers([mockUserTaylor, mockUserLayla, mockUserJohn]);

        usersIds.push(...createdUsers);
        personalChatUsers.push(...createdUsers.slice(0, -1));

        chatId = await createChat(personalChatUsers);
        groupChatId = await createChat(usersIds, true);

        chatPayload = { user_id: personalChatUsers[0]!, chat_id: chatId , body:'Message'}
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
        if(groupChatId){
            await request(app).del(`/api/chats/${groupChatId}`);
        }
    });

    describe("POST /api/chat-messages", () => {
        it("Validation fails for a blank message", async() => {
            const res = await request(app).post("/api/chat-messages").send({...chatPayload, body: '   '});
            expect(res.statusCode).toBe(400);
        });
        it("Validation fails for a bad user", async() => {
            const res = await request(app).post("/api/chat-messages").send({...chatPayload, user_id:chatPayload.user_id.slice(0, -2) + '1'});
            expect(res.statusCode).toBe(400);
        });
        it("Validation fails for a bad chat", async() => {
            const res = await request(app).post("/api/chat-messages").send({...chatPayload, chat_id:chatPayload.chat_id.slice(0, -2) + '1'});
            expect(res.statusCode).toBe(400);
        });
        it("Creates message in personal-chat", async() => {
            const res = await request(app).post("/api/chat-messages").send(chatPayload);
            messageId = res.body._id;
            expect(res.statusCode).toBe(200);
            expect(res.body.body).toEqual(chatPayload.body);
        })
        it("Creates message in group-chat", async() => {
            const res = await request(app).post("/api/chat-messages").send({...chatPayload, chat_id: groupChatId});
            groupChatMessageId = res.body._id;
            expect(res.statusCode).toBe(200);
            expect(res.body.body).toEqual(chatPayload.body);
        })
    });

    describe("GET /api/chat-messages", () => {
        it("Return chat messages", async() => {
            const res = await request(app).get(`/api/chat-messages/?chat_id=${chatId}`);
            expect(res.statusCode).toBe(200);
            expect(res.body.length).toBeGreaterThan(0);
        });
        it("Return gtoup-chat messages", async() => {
            const res = await request(app).get(`/api/chat-messages/?chat_id=${groupChatId}`);
            expect(res.statusCode).toBe(200);
            expect(res.body.length).toBeGreaterThan(0);
        });
    })

    describe("PUT /api/chat-messages", () => {
        it("Edit chat messages", async() => {
            const res = await request(app).put(`/api/chat-messages/${messageId}`).send({body: "new body"});
            expect(res.statusCode).toBe(200);
            expect(res.body.body).toEqual("new body");
        });
        it("Edit group-chat messages", async() => {
            const res = await request(app).put(`/api/chat-messages/${groupChatMessageId}`).send({body: "new body"});
            expect(res.statusCode).toBe(200);
            expect(res.body.body).toEqual("new body");
        });
    })


    describe("DEL /api/chat-messages", () => {
        it("Deletes message", async() => {
            await request(app).del(`/api/chat-messages/${messageId}`).expect(200);
        })
        it("Deletes group-chat message", async() => {
            await request(app).del(`/api/chat-messages/${groupChatMessageId}`).expect(200);
        })
        // it("No chat messages left", async() => {
        //     await request(app).del(`/api/user-contacts/${contactId}`).expect(200);
        // })
    })
})




