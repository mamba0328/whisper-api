import { Types } from "mongoose";
import { Chats } from "../../models/Chats";
import { ChatPayload } from "../../types/types";

export const createChat = async (chatPayload:ChatPayload):Promise<Types.ObjectId> => {
    const chat = await Chats.create(chatPayload);

    return chat._id;
};
