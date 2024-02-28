import express from "express";
import { deleteMessageSeenBy, getMessageSeenBy, postMessageSeenBy } from "../../controllers/MessageSeenBy";

const router = express.Router();

router.get("/message-seen-by", getMessageSeenBy);

router.post("/message-seen-by", postMessageSeenBy);

router.delete("/message-seen-by/:id", deleteMessageSeenBy);

export default router;
