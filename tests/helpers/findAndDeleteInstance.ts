import request from "supertest";
import app from "../../app";

// eslint-disable-next-line
export const findAndDeleteInstance = async (route:string, queryData: Record<string, any>) => {
    try {
        const query:string = getQueryStringFromObject(queryData);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const userResponse = await request(app).get(`/api/${route}/?${query}`);
        const instanceId = userResponse.body[0]._id;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await request(app).del(`/api/${route}/${instanceId}`);
    } catch (error) {
        console.log(error);
    }
};

const getQueryStringFromObject = (queryData: Record<string, string>):string => {
    return Object.entries(queryData).reduce((accumulatorString:string, entry:string[]) => {
        const [key, value] = entry;

        if (Array.isArray(value)) {
            return accumulatorString + `${key}=${value.join(",")}`;
        }

        return accumulatorString + `${key}=${value}`;
    }, "");
};
