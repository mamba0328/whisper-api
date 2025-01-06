import { Request } from "express";
import { v2 as cloudinary } from "cloudinary";

import { cloudinaryConfig } from "../../helpers/consts";

export default (req:Request) => {
    const expectedSignature = cloudinary.utils.api_sign_request({
        public_id: req.body.public_id,
        version: req.body.version
    }, cloudinaryConfig.api_secret);

    return expectedSignature === req.body.signature;
};
