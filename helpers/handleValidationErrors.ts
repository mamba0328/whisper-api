import { validationResult } from "express-validator";
import { Request, Response } from "express";
import { deleteFile } from "./deleteFile";
export const handleValidationErrors = (req:Request, res:Response) => {
    const result = validationResult(req);
    // @ts-ignore
    const { errors } = result;
    const validationFailed = errors.length;

    if (validationFailed) {
        const requestContainedFile = req.file?.path;

        requestContainedFile && deleteFile(req.file!.path);

        res.status(400).json(errors);

        throw Error("Errors occurred");
    }
};
