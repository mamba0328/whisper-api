require("dotenv").config();
import mongoose from "mongoose";

import { ChatMessages } from "../../models/ChatMessages";
import { Chats } from "../../models/Chats";
import { MessageSeenBy } from "../../models/MessageSeenBy";
import { UserContacts } from "../../models/UserContacts";
import { Users } from "../../models/Users";

const dropTestDB = async () => {
    try {
        await ChatMessages.deleteMany({});
        console.log("ChatMessages cleared");
        await Chats.deleteMany({});
        console.log("Chats cleared");
        await MessageSeenBy.deleteMany({});
        console.log("MessageSeenBy cleared");
        await UserContacts.deleteMany({});
        console.log("UserContacts cleared");
        await Users.deleteMany({});
        console.log("Users cleared");
    } catch (error) {
        console.log(error);
    }
};

void (async () => {
    await mongoose.connect(process.env.TEST_DB_MONGO_URI!);
    await dropTestDB();
    return mongoose.disconnect();
})();

