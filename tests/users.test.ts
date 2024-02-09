import mongoose from "mongoose";
import request from "supertest";
import app from "../app";

require("dotenv").config();

/* Connecting to the database before each test. */
beforeEach(async () => {
    await mongoose.connect(process.env.TEST_DB_MONGO_URI!);
});

/* Closing database connection after each test. */
afterEach(async () => {
    await mongoose.connection.close();
});

describe("GET /api/users", () => {
    it("Route is responding 200", async () => {
        const res = await request(app).get("/api/users");
        expect(res.statusCode).toBe(200);
    });
});