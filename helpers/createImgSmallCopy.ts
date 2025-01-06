import sharp from "sharp";

export const createImgSmallCopy = async (path:string):Promise<boolean> => {
    try {
        const smallCopyPath = path.split("/");

        smallCopyPath[smallCopyPath.length - 1] = smallCopyPath[smallCopyPath.length - 1]!.replace(".", "-small.");

        console.log(smallCopyPath.join("/"));

        sharp(path).resize(20, null).toFile(smallCopyPath.join("/"), (err) => {
            if (err) {
                throw err;
            }

            return;
        });

        return true;
    } catch (error) {
        console.log(error);

        return false;
    }
};
