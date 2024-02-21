import request from "supertest";
import app from "../../app";

export const createMessage = async (chatId:string, userId:string, body:string) => {
    let chatMessageId:string;

    try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const newMessage = await request(app).post("/api/chat-messages").send({ chat_id: chatId, user_id: userId, body });
        chatMessageId = newMessage.body._id;
        return chatMessageId;
    } catch (error) {
        console.log(error);
        return "";
    }
};
