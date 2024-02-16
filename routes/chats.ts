import express from "express";

import { postChat, deleteChat, putChat } from "../controllers/Chats";

const router = express.Router();

// router.get("/chats", getChats);

router.post("/chats", postChat);

router.put("/chats/:id", putChat);

router.delete("/chats/:id", deleteChat);

export default router;
