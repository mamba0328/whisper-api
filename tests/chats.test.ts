// @ts-ignore
import session from "supertest-session";
import app from "../app";
import { mockAdmin } from "./consts/mocks";
import {User} from "../types/types";
import {Types} from "mongoose";


describe("Chat API Tests", () => {
    const testSession = session(app);

    const usersIds:Types.ObjectId[] = [];
    const personalChatUsers:Types.ObjectId[] = [];

    let chatId:Types.ObjectId;
    let groupChatId:Types.ObjectId;

    beforeAll( async () => {
        await testSession.post("/sign-in").send({ identity_field: mockAdmin.username, password: mockAdmin.password });

        const { body:usersResponse }:{ body: User[] } = await testSession.get('/api/users/');

        usersIds.push(...usersResponse.map(user => user._id));
        personalChatUsers.push(usersResponse[0]!._id, usersResponse[1]!._id);
    });

    afterAll(async () => {
        await testSession.post("/sign-out").send()
    });

    describe("POST /api/chats", () => {
        it("Validation fails for a personal chat with more then 2 users", async() => {
            const res = await testSession.post("/api/chats").send({chat_users: [...usersIds]});
            expect(res.statusCode).toBe(400);
        });
        it("Validation fails for a personal chat with less then 2 users", async() => {
            const res = await testSession.post("/api/chats").send({chat_users: [usersIds[0]]});
            expect(res.statusCode).toBe(400);
        });
        it("Validation doesnt allow empty chats", async() => {
            const res = await testSession.post("/api/chats").send({chat_users: []});
            expect(res.statusCode).toBe(400);
        });
        it("Creates group-chat with the same users", async() => {
            const chatPayload = { chat_users: personalChatUsers }
            const res = await testSession.post("/api/chats").send(chatPayload);
            chatId = res.body._id;
            expect(res.statusCode).toBe(200);
        })
        it("Validation fails for an non-unique chat", async() => {
            const res = await testSession.post("/api/chats").send({chat_users: personalChatUsers});
            expect(res.statusCode).toBe(400);
        });
        it("Creates group-chat with the same users", async() => {
            const chatPayload = { chat_users: usersIds, chat_name: 'unique_name', is_group_chat: true }
            const res = await testSession.post("/api/chats").send(chatPayload);
            groupChatId = res.body._id;
            expect(res.statusCode).toBe(200);
        })
    });

    describe("PUT /api/chats", () => {
        it("Validation fails for a personal chat", async() => {
            const res = await testSession.put(`/api/chats/${chatId}`).send({chat_users: usersIds});
            expect(res.statusCode).toBe(400);
        });
        it("Changes applied to the groupchat", async() => {
            const res = await testSession.put(`/api/chats/${groupChatId}`).send({chat_users: personalChatUsers, chat_name:'new_name'},);
            expect(res.statusCode).toBe(200);
            expect(res.body.chat_name).toEqual("new_name");
            expect(res.body.chat_users).toEqual(personalChatUsers);
        });
    });

    describe("DEL /api/chats", () => {
        it("Deletes chat", async() => {
            await testSession.delete(`/api/chats/${chatId}`).expect(200);
        })
        it("Deletes group chat", async() => {
            await testSession.delete(`/api/chats/${groupChatId}`).expect(200);
        })
        // it("No chat messages left", async() => {
        //     await testSession.del(`/api/user-contacts/${contactId}`).expect(200);
        // })
    })
})




