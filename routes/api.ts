import express from "express";
import userRouter from "./apiRoutes/users";
import usersContactsRouter from "./apiRoutes/users-contacts";
import chatMessagesRouter from "./apiRoutes/chat-messages";
import chatsRouter from "./apiRoutes/chats";

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



export default router;

