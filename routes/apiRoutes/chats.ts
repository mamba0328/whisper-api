import express from "express";

import { getChats, getSingleChat, postChat, deleteChat, putChat } from "../../controllers/Chats";

const router = express.Router();

router.get("/chats", getChats);

router.get("/chats/:id", getSingleChat);

router.post("/chats", postChat);

router.put("/chats/:id", putChat);

router.delete("/chats/:id", deleteChat);

export default router;
