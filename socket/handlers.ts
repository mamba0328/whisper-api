import { Socket, Server } from "socket.io";
import { Message, MessageImg, MessagePayload } from "../types/types";
import { ChatMessages } from "../models/ChatMessages";
import { Chats } from "../models/Chats";
import { MessageSeenBy } from "../models/MessageSeenBy";
import { MessagesImgs } from "../models/MessagesImgs";

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

    socket.on("createMessage", async (message:MessagePayload, callback:CallableFunction) => {
        // @ts-ignore
        const sender = socket.request.user;
        const chat = await Chats.findById(message.chat_id);
        const receivers = chat?.chat_users.filter((user_id) => user_id.toString() !== sender._id.toString()) ?? [];

        const newMessage:Message = await ChatMessages.create({
            ...message,
            status: "new", // TODO better types
            created_at: new Date().toISOString() // now
        });

        if (message.message_img) {
            const img:MessageImg = await MessagesImgs.create({
                ...message.message_img,
                message_id: newMessage._id,
                created_at: new Date().toISOString() // now
            });
            newMessage.message_imgs = [img];
        }

        socket.to(message.chat_id.toString()).emit("newMessage", newMessage);

        receivers.forEach((receiverId) => {
            const receiverPersonalRoom = io.sockets.adapter.rooms.get(receiverId.toString());

            let isReceiverInsideChatRoom = false;

            if (receiverPersonalRoom) {
                const receiverSid = Array.from(receiverPersonalRoom)[0]!;
                isReceiverInsideChatRoom = io.sockets.adapter.rooms.get(message.chat_id.toString())?.has(receiverSid) ?? false;
            }

            if (!isReceiverInsideChatRoom) {
                socket.to(receiverId.toString()).emit("newMessageNotification", newMessage);
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

    socket.on("viewMessage", async ({ user_id, message_id, chat_id }, callback) => {
        const now = new Date();

        const messageSeenBy = await MessageSeenBy.create({
            user_id,
            message_id,
            created_at: now.toISOString()
        });

        if (!messageSeenBy) {
            callback(false);
            return;
        }

        socket.to(chat_id as string).emit("messageWasSeen", messageSeenBy);
        callback(messageSeenBy);
    });

    socket.on("startWriting", async (chat_id) => {
        // @ts-ignore
        const { username, _id: user_id } = socket.request.user;
        const chat = await Chats.findById(chat_id);
        const receivers = chat?.chat_users.filter((receiver) => receiver.toString() !== user_id) ?? [];

        receivers.forEach((receiverId) => {
            socket.to(receiverId.toString()).emit("userIsWriting", { user_id, chat_id });
        });
    });

    socket.on("stopWriting", async (chat_id) => {
        // @ts-ignore
        const { username, _id: user_id } = socket.request.user;
        const chat = await Chats.findById(chat_id);
        const receivers = chat?.chat_users.filter((receiver) => receiver.toString() !== user_id) ?? [];

        receivers.forEach((receiverId) => {
            socket.to(receiverId.toString()).emit("userStoppedWriting", { user_id, chat_id });
        });
    });
};
