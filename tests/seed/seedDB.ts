require("dotenv").config();

import { createUsers } from "../helpers/createUsers";
import { createChat } from "../helpers/createChat";
import { createMessage } from "../helpers/createMessage";

import { mockUserJohn, mockUserTaylor, mockUserLayla, mockAdmin } from "../consts/mocks";
import mongoose, { Types } from "mongoose";

const seedDB = async () => {
    const usersIds:Types.ObjectId[] = [];
    const personalChatUsers:Types.ObjectId[] = [];

    // CREATE USERS
    const createdUsers = await createUsers([mockAdmin, mockUserTaylor, mockUserLayla, mockUserJohn]);
    usersIds.push(...createdUsers);
    personalChatUsers.push(...createdUsers.slice(0, 2));
    console.log("Users seeding is successful");

    // CREATE CHATS
    const chatId = await createChat({ chat_users: personalChatUsers });
    await createChat({ chat_users: usersIds, is_group_chat: true });
    console.log("Chats seeding is successful");

    // CREATE MESSAGE
    await createMessage({
        user_id: usersIds[0]!,
        chat_id: chatId,
        body: "Hello Layla!"
    });
    console.log("Message seeding is successful");
};


void (async () => {
    await mongoose.connect(process.env.TEST_DB_MONGO_URI!);
    await seedDB();
})();

