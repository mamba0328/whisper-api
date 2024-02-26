import { unlink } from "node:fs";
import fs from "fs";
export const deleteFile = (filepath:string) => {
    try {
        if (!fs.existsSync(filepath)) {
            return console.log("File don`t exists");
        }
        unlink(filepath, (error) => {
            if (error) throw error;
            console.log(`file on ${filepath} was deleted`);
        });
    } catch (error) {
        console.log(error);
    }
};
