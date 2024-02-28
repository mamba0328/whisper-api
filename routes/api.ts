import express from "express";
import userRouter from "./apiRoutes/users";
import usersContactsRouter from "./apiRoutes/users-contacts";
import chatMessagesRouter from "./apiRoutes/chat-messages";
import chatsRouter from "./apiRoutes/chats";
import messageSeenByRouter from "./apiRoutes/message-seen-by";
import { isAuth } from "../middleware/authentication /isAuth";

const router = express.Router();

// @ts-ignore
router.use(isAuth);

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
