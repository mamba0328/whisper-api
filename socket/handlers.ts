import { Socket, Server } from "socket.io";
import { Message } from "../types/types";
import { ChatMessages } from "../models/ChatMessages";
import { Chats } from "../models/Chats";

export default (io:Server, socket:Socket) => {
    socket.on("message", async (message:Message, callback:CallableFunction) => {
        // @ts-ignore
        const sender = socket.request.user;
        const chat = await Chats.findById(message.chat_id);

        const receivers = chat?.chat_users.filter((user_id) => user_id.toString() !== sender._id.toString()) ?? [];

        const newMessage = await ChatMessages.create({
            ...message,
            status: "new", // TODO better types
            created_at: new Date().toISOString() // now
        });

        socket.to(message.chat_id.toString()).emit("message", newMessage);

        receivers.forEach((receiverId) => {
            const receiverPersonalRoom = io.sockets.adapter.rooms.get(receiverId.toString());

            let isReceiverInsideChatRoom = false;

            if (receiverPersonalRoom) {
                const receiverSid = Array.from(receiverPersonalRoom)[0]!;
                isReceiverInsideChatRoom = io.sockets.adapter.rooms.get(message.chat_id.toString())?.has(receiverSid) ?? false;
            }

            if (!isReceiverInsideChatRoom) {
                socket.to(receiverId.toString()).emit("message-notification", newMessage);
            }
        });


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
};
