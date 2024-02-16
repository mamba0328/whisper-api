import express from "express";
import userRouter from "./users";
import usersContactsRouter from "./users-contacts";
// import chatMessagesRouter from "./chat-messages";
import chatsRouter from "./chats";

const router = express.Router();

// api/user-contacts
router.use(usersContactsRouter);

// api/users
router.use(userRouter);

// api/chat-messages
// router.use(chatMessagesRouter);

// api/chats
router.use(chatsRouter);


export default router;
