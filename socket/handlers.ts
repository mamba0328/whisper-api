import { Socket, Server } from "socket.io";
import { Message } from "../types/types";
import { ChatMessages } from "../models/ChatMessages";
import { Chats } from "../models/Chats";
import { MessageSeenBy } from "../models/MessageSeenBy";

export default (io:Server, socket:Socket) => {
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

    socket.on("createMessage", async (message:Message, callback:CallableFunction) => {
        // @ts-ignore
        const sender = socket.request.user;
        const chat = await Chats.findById(message.chat_id);
        const receivers = chat?.chat_users.filter((user_id) => user_id.toString() !== sender._id.toString()) ?? [];

        const newMessage = await ChatMessages.create({
            ...message,
            status: "new", // TODO better types
            created_at: new Date().toISOString() // now
        });

        socket.to(message.chat_id.toString()).emit("newMessage", newMessage);


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

    socket.on("deleteMessage", async (message:Message, callback:CallableFunction) => {
        // @ts-ignore
        const wasDeleted = await ChatMessages.findByIdAndDelete(message._id);

        if (!wasDeleted) {
            callback(false);
            return;
        }

        socket.to(message.chat_id.toString()).emit("messageWasDeleted", message._id);

        callback(true);
    });

    socket.on("updateMessage", async (message:Message, callback:CallableFunction) => {
        // @ts-ignore
        const wasUpdated = await ChatMessages.findByIdAndUpdate(message._id, { body: message.body, updated_at: new Date().toISOString() });

        if (!wasUpdated) {
            callback(null);
            return;
        }

        const updatedMessage = await ChatMessages.findById(message._id);

        socket.to(message.chat_id.toString()).emit("messageWasUpdated", updatedMessage);

        callback(updatedMessage);
    });

    socket.on("seenMessage", async ({ user_id, message_id, chat_id }) => {
        const now = new Date();

        await MessageSeenBy.create({
            user_id,
            message_id,
            created_at: now.toISOString()
        });

        socket.to(chat_id as string).emit("messageWasSeen", message_id);
    });

    socket.on("startWriting", async ({ user_id, username, chat_id }) => {
        const chat = await Chats.findById(chat_id);
        const receivers = chat?.chat_users.filter((receiver) => receiver.toString() !== user_id) ?? [];

        receivers.forEach((receiverId) => {
            socket.to(receiverId.toString()).emit("userIsWriting", username);
        });
    });

    socket.on("stopWriting", async ({ user_id, username, chat_id }) => {
        const chat = await Chats.findById(chat_id);
        const receivers = chat?.chat_users.filter((receiver) => receiver.toString() !== user_id) ?? [];

        receivers.forEach((receiverId) => {
            socket.to(receiverId.toString()).emit("userStoppedWriting", username);
        });
    });
};
