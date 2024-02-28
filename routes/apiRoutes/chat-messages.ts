import express from "express";

import { getChatMessages, postChatMessage, putChatMessage, deleteChatMessage } from "../../controllers/ChatMessages";

const router = express.Router();

router.get("/chat-messages", getChatMessages);

router.post("/chat-messages", postChatMessage);

router.put("/chat-messages/:id", putChatMessage);

router.delete("/chat-messages/:id", deleteChatMessage);

export default router;
