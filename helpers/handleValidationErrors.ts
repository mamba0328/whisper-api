import { validationResult } from "express-validator";
import { Request, Response } from "express";

export const handleValidationErrors = (req:Request, res:Response) => {
    const result = validationResult(req);
    // @ts-ignore
    const errors = result.errors;

    if (errors.length) {
        res.status(400).json(errors);

        throw Error("Errors occurred");
    }
};
