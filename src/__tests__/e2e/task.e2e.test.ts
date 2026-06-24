import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import { vi } from "vitest";
import testPrisma from "./setup.js";

// Mock the prisma singleton to use the test client
vi.mock("../../lib/prisma.js", () => ({
  default: testPrisma,
}));

// Import app AFTER mocking prisma
const { default: app } = await import("../../app.js");
import request from "supertest";

describe("Task API E2E Tests", () => {
  beforeEach(async () => {
    // Clean up database between tests
    await testPrisma.task.deleteMany();
  });

  afterAll(async () => {
    await testPrisma.$disconnect();
  });

  describe("POST /api/tasks", () => {
    it("should create a new task", async () => {
      const res = await request(app)
        .post("/api/tasks")
        .send({ title: "E2E Task", description: "E2E Description" });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body.title).toBe("E2E Task");
      expect(res.body.description).toBe("E2E Description");
      expect(res.body.completed).toBe(false);
    });

    it("should return 400 if title is missing", async () => {
      const res = await request(app)
        .post("/api/tasks")
        .send({ description: "E2E Description" });

      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/tasks", () => {
    it("should return an empty list when no tasks exist", async () => {
      const res = await request(app).get("/api/tasks");

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it("should return all tasks ordered by createdAt desc", async () => {
      // Create multiple tasks
      const task1 = await request(app)
        .post("/api/tasks")
        .send({ title: "Task 1", description: "Description 1" });

      const task2 = await request(app)
        .post("/api/tasks")
        .send({ title: "Task 2", description: "Description 2" });

      const res = await request(app).get("/api/tasks");

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      // Most recent task should be first (task2)
      expect(res.body[0].id).toBe(task2.body.id);
      expect(res.body[1].id).toBe(task1.body.id);
    });
  });

  describe("GET /api/tasks/:id", () => {
    it("should return a task by id", async () => {
      const createRes = await request(app)
        .post("/api/tasks")
        .send({ title: "Get Task", description: "Get Description" });

      const taskId = createRes.body.id;
      const res = await request(app).get(`/api/tasks/${taskId}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(taskId);
      expect(res.body.title).toBe("Get Task");
    });

    it("should return 404 if task does not exist", async () => {
      const res = await request(app).get("/api/tasks/9999");

      expect(res.status).toBe(404);
    });

    it("should return 400 if id is invalid", async () => {
      const res = await request(app).get("/api/tasks/invalid");

      expect(res.status).toBe(400);
    });
  });

  describe("PUT /api/tasks/:id", () => {
    it("should update a task", async () => {
      const createRes = await request(app)
        .post("/api/tasks")
        .send({ title: "Original Title", description: "Original Description" });

      const taskId = createRes.body.id;
      const updateRes = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send({
          title: "Updated Title",
          description: "Updated Description",
          completed: true,
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.id).toBe(taskId);
      expect(updateRes.body.title).toBe("Updated Title");
      expect(updateRes.body.description).toBe("Updated Description");
      expect(updateRes.body.completed).toBe(true);
    });

    it("should return 404 if task does not exist", async () => {
      const res = await request(app)
        .put("/api/tasks/9999")
        .send({ title: "Updated Title" });

      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /api/tasks/:id", () => {
    it("should delete a task", async () => {
      const createRes = await request(app)
        .post("/api/tasks")
        .send({ title: "Delete Task", description: "To be deleted" });

      const taskId = createRes.body.id;
      const deleteRes = await request(app).delete(`/api/tasks/${taskId}`);

      expect(deleteRes.status).toBe(204);

      // Verify task is deleted
      const getRes = await request(app).get(`/api/tasks/${taskId}`);
      expect(getRes.status).toBe(404);
    });

    it("should return 404 if task does not exist", async () => {
      const res = await request(app).delete("/api/tasks/9999");

      expect(res.status).toBe(404);
    });
  });
});
