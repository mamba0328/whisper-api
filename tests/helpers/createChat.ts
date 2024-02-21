import request from "supertest";
import app from "../../app";
import { findAndDeleteInstance } from "./findAndDeleteInstance";

export const createChat = async (usersIds:string[], is_group_chat?:boolean) => {
    let chatId:string;

    try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const newChat = await request(app).post("/api/chats").send({ chat_users: usersIds, ...is_group_chat && { is_group_chat } });
        if (newChat.statusCode !== 200) { // usually bad response if contact already exists, so we'll delete it
            await findAndDeleteInstance("chats", { chat_users: usersIds, is_group_chat: false });
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            const reqChat = await request(app).post("/api/chat").send({ chat_users: usersIds });
            chatId = reqChat.body._id;
            return chatId;
        }

        chatId = newChat.body._id;
        return chatId;
    } catch (error) {
        console.log(error);
        return "";
    }
};
