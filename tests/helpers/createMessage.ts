import { MessagePayload } from "../../types/types";

import { ChatMessages } from "../../models/ChatMessages";


export const createMessage = async (messagePayload:MessagePayload) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const newMessage = await ChatMessages.create(messagePayload);

    return newMessage._id;
};
