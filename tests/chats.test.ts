import request from "supertest";
import app from "../app";

import { mockUserTaylor, mockUserLayla, mockUserJohn } from "./consts/mocks";
import { createUsers } from "./helpers/createUsers";
import {findAndDeleteInstance} from "./helpers/findAndDeleteInstance";

describe("User API Tests", () => {
    const usersIds:string[] = [];
    let chatId:string;
    let groupChatId:string;

    beforeAll( async () => {
        const createdUsers = await createUsers([mockUserTaylor, mockUserLayla, mockUserJohn]);
        usersIds.push(...createdUsers);

        const newChat = await request(app).post("/api/chats").send({chat_users: usersIds});

        if(newChat.statusCode !== 200) {//usually bad response if contact already exists, so we'll delete it
            await findAndDeleteInstance("chats", {chat_users: usersIds, is_group_chat:false})
            const reqChat = await request(app).post("/api/user-contacts").send({chat_users: usersIds});
            return chatId = reqChat.body._id;
        }

        chatId = newChat.body._id;
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
            const res = await request(app).post("/api/chats").send({chat_users: usersIds});
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




