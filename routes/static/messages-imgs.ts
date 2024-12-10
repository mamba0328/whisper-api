import express from "express";
import { serveImg } from "../../controllers/MessagesImgs";

const router = express.Router();

router.get("/messages_imgs/:filename", serveImg);

export default router;
