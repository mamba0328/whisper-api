
import { Server, Socket } from "socket.io";
import { Message } from "../types/types";
import { ChatMessages } from "../models/ChatMessages";

export default function onConnection (io:Server, socket:Socket) {
    socket.on("message", async (message:Message, callback:CallableFunction) => {
        const newMessage = await ChatMessages.create({
            ...message,
            status: "new", // TODO better types
            created_at: new Date().toISOString() // now
        });

        socket.to(message.chat_id.toString()).emit("message", newMessage);
        callback(newMessage);
    });

    socket.on("enterRoom", async (chatId:string) => {
        if (!chatId) {
            return;
        }
        await socket.join(chatId);
    });

    socket.on("leaveRoom", async (chatId:string) => {
        if (!chatId) {
            return;
        }
        await socket.leave(chatId);
    });
}
