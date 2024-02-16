import { Request, Response } from "express";
import express from "express";

const router = express.Router();

/* GET home page. */
router.get("/", function (req:Request, res:Response) {
    res.send("Hello world!");
});

export default router;
