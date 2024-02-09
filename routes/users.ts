import express from "express";
import { Request, Response } from "express";

const router = express.Router();

router.get("/", function (req:Request, res:Response) {
    res.send("respond with a resource");
});

module.exports = router;
