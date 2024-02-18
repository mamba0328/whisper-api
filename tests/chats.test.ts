import request from "supertest";
import app from "../app";

import { mockUserTaylor, mockUserLayla, mockUserJohn } from "./consts/mocks";
import { createUsers } from "./helpers/createUsers";
import {createChat} from "./helpers/createChat";

describe("Chat API Tests", () => {
    const usersIds:string[] = [];
    const personalChatUsers:string[] = [];

    let chatId:string;
    let groupChatId:string;

    beforeAll( async () => {
        const createdUsers = await createUsers([mockUserTaylor, mockUserLayla, mockUserJohn]);

        usersIds.push(...createdUsers);
        personalChatUsers.push(...usersIds.slice(0, 2));

        chatId = await createChat(personalChatUsers);
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
    });

    describe("POST /api/chats", () => {
        it("Validation fails for an non-unique chat", async() => {
            const res = await request(app).post("/api/chats").send({chat_users: personalChatUsers});
            expect(res.statusCode).toBe(400);
        });
        it("Validation fails for a personal chat with more then 2 users", async() => {
            const res = await request(app).post("/api/chats").send({chat_users: [...usersIds]});
            expect(res.statusCode).toBe(400);
        });
        it("Validation fails for a personal chat with less then 2 users", async() => {
            const res = await request(app).post("/api/chats").send({chat_users: [usersIds[0]]});
            expect(res.statusCode).toBe(400);
        });
        it("Validation doesnt allow empty chats", async() => {
            const res = await request(app).post("/api/chats").send({chat_users: []});
            expect(res.statusCode).toBe(400);
        });
        it("Creates group-chat with the same users", async() => {
            const chatPayload = { chat_users: usersIds, chat_name: 'unique_name', is_group_chat: true }
            const res = await request(app).post("/api/chats").send(chatPayload);
            groupChatId = res.body._id;
            expect(res.statusCode).toBe(200);
        })
    });

    describe("DEL /api/chats", () => {
        it("Deletes chat", async() => {
            await request(app).del(`/api/chats/${chatId}`).expect(200);
        })
        it("Deletes group chat", async() => {
            await request(app).del(`/api/chats/${groupChatId}`).expect(200);
        })
        // it("No chat messages left", async() => {
        //     await request(app).del(`/api/user-contacts/${contactId}`).expect(200);
        // })
    })
})




