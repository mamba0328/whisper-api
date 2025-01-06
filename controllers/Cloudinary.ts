import { Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";
import { cloudinaryConfig } from "../helpers/consts";

export const getSignature = [
    (req:Request, res:Response) => {
        const timestamp = Math.round(new Date().getTime() / 1000);
        const signature = cloudinary.utils.api_sign_request(
            {
                timestamp: timestamp
            },
            cloudinaryConfig.api_secret
        );
        res.json({ timestamp, signature });
    }
];
