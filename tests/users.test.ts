import request from "supertest";
import app from "../app";
import { mockUserJohn } from "./consts/mocks";
import { findAndDeleteInstance } from "./helpers/findAndDeleteInstance";

describe("User API Tests", () => {
    let createdUserId:string;

    beforeAll( async () => {
        const createUserResponse = await request(app).post("/api/users").send(mockUserJohn);

        if(createUserResponse.statusCode === 400){
            await findAndDeleteInstance('users', {username: mockUserJohn.username});
            const createUserResponse = await request(app).post("/api/users").send(mockUserJohn);
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
            const res = await request(app).post("/api/users").send(mockUserJohn);
            expect(res.statusCode).toBe(400);
        });
    });

    describe("GET /api/users", () => {
        it("Returns users", async () => {
            const getUserResponse = await request(app).get("/api/users");
            expect(getUserResponse.body.length).toBeGreaterThan(0);
            expect(getUserResponse.body[0].username).toEqual(mockUserJohn.username);
        });
    });

    describe("PUT /api/users", () => {
        it("Update user", async() => {
            const res = await request(app).put(`/api/users/${createdUserId}`).send({
                first_name: 'Layla',
            });
            expect(res.body.first_name).toBe('Layla');
        })
        it("Validate wrong userId", async() => {
            const res = await request(app).put(`/api/users/${createdUserId.slice(0, -2) + 'e'}`).send({
                first_name: 'Layla',
            });
            expect(res.statusCode).toBe(400);
        })
    })

    describe("DEL /api/users", () => {
        it("Delete user", async() => {
            await request(app).del(`/api/users/${createdUserId}`).expect(200);
        })
    })
})




