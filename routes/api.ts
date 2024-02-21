import express from "express";
import userRouter from "./users";
import usersContactsRouter from "./users-contacts";
import chatMessagesRouter from "./chat-messages";
import chatsRouter from "./chats";
import messageSeenByRouter from "./message-seen-by";

const router = express.Router();

// api/user-contacts
router.use(usersContactsRouter);

// api/users
router.use(userRouter);

// api/chat-messages
router.use(chatMessagesRouter);

// api/chats
router.use(chatsRouter);

// api/message-seen-by
router.use(messageSeenByRouter);


export default router;
