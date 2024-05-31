import express from "express";
import { getMessageImg, } from "../../controllers/MessagesImgs";

const router = express.Router();

router.get("/messages-imgs/:id", getMessageImg);


export default router;
