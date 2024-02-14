import request from "supertest";
import app from "../../app";

export const findAndDeleteUser = async (username:string) => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const userResponse = await request(app).get(`/api/users/?username=${username}`);
        const userId = userResponse.body[0]._id;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await request(app).del(`/api/users/${userId}`);
    } catch (error) {
        console.log(error);
    }
};
