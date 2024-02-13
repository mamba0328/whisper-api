import mongoose from "mongoose";
import request from "supertest";
import app from "../app";

require("dotenv").config();

const mockUser = {
    first_name: 'John',
    last_name: 'Doe',
    username: 'johndoe123',
    date_of_birth: '1990-01-01',
    user_img: 'https://example.com/avatar.jpg',
    phone_number: '1234567890',
    email: 'john.doe@example.com',
    password: 'strongpassword123',
};

const findAndDeleteUser = async () => {
    try {
        const userResponse =  await request(app).get(`/api/users/?username=${mockUser.username}`);
        const userId = userResponse.body[0]._id;
        await request(app).del(`/api/users/${userId}`);
    } catch (error){
        console.log(error);
    }
}

describe("User API Tests", () => {
    let createdUserId:string;

    beforeAll( async () => {
        const createUserResponse = await request(app).post("/api/users").send(mockUser);

        if(createUserResponse.statusCode === 400){
            await findAndDeleteUser();
            const createUserResponse = await request(app).post("/api/users").send(mockUser);
            return createdUserId = createUserResponse.body._id;
        }

        createdUserId = createUserResponse.body._id;
    });

    afterAll(async () => {
        if (createdUserId) {
            await request(app).del(`/api/users/${createdUserId}`);
        }
    });

    describe("POST /api/users", () => {
        it("Validation fails for an non-unique user", async() => {
            const res = await request(app).post("/api/users").send(mockUser);
            expect(res.statusCode).toBe(400);
        });
    });

    describe("GET /api/users", () => {
        it("Returns users", async () => {
            const getUserResponse = await request(app).get("/api/users");
            expect(getUserResponse.body.length).toBeGreaterThan(0);
        });
    });

    describe("PUT /api/users", () => {
        it("Update user", async() => {
            const res = await request(app).put(`/api/users/${createdUserId}`).send({
                first_name: 'Layla',
            });
            expect(res.body.first_name).toBe('Layla');
        })
    })

    describe("DEL /api/users", () => {
        it("Delete user", async() => {
            await request(app).del(`/api/users/${createdUserId}`).expect(200);
        })
    })
})




