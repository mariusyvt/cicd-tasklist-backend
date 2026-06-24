import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response } from "express";
import type { Task } from "@prisma/client";

// Mock the service module
vi.mock("../../services/task.service.js", () => ({
  findAll: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
}));

import * as taskService from "../../services/task.service.js";
import * as taskController from "../../controllers/task.controller.js";

const mockService = vi.mocked(taskService);

const mockTask: Task = {
  id: 1,
  title: "Test Task",
  description: "Test description",
  completed: false,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

function createMockResponse(): Response {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  } as unknown as Response;
  return res;
}

function createMockRequest(overrides: Partial<Request> = {}): Request {
  return {
    params: {},
    body: {},
    query: {},
    ...overrides,
  } as unknown as Request;
}

describe("TaskController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAllTasks", () => {
    it("should return 200 with all tasks", async () => {
      const tasks = [mockTask];
      mockService.findAll.mockResolvedValue(tasks);
      const req = createMockRequest();
      const res = createMockResponse();

      await taskController.getAllTasks(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(tasks);
    });

    it("should return 500 on error", async () => {
      mockService.findAll.mockRejectedValue(new Error("Database error"));
      const req = createMockRequest();
      const res = createMockResponse();

      await taskController.getAllTasks(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("getTaskById", () => {
    it("should return 200 with a task", async () => {
      mockService.findById.mockResolvedValue(mockTask);
      const req = createMockRequest({ params: { id: "1" } });
      const res = createMockResponse();

      await taskController.getTaskById(req, res);

      expect(mockService.findById).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockTask);
    });

    it("should return 404 if task not found", async () => {
      mockService.findById.mockResolvedValue(null);
      const req = createMockRequest({ params: { id: "1" } });
      const res = createMockResponse();

      await taskController.getTaskById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("should return 400 for invalid task id", async () => {
      const req = createMockRequest({ params: { id: "invalid" } });
      const res = createMockResponse();

      await taskController.getTaskById(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 500 on database error", async () => {
      mockService.findById.mockRejectedValue(new Error("Database error"));
      const req = createMockRequest({ params: { id: "1" } });
      const res = createMockResponse();

      await taskController.getTaskById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("createTask", () => {
    it("should return 201 with created task", async () => {
      mockService.create.mockResolvedValue(mockTask);
      const req = createMockRequest({
        body: { title: "New Task", description: "New Description" },
      });
      const res = createMockResponse();

      await taskController.createTask(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockTask);
    });

    it("should return 400 if title is missing", async () => {
      const req = createMockRequest({ body: { description: "No title" } });
      const res = createMockResponse();

      await taskController.createTask(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 400 if title is empty", async () => {
      const req = createMockRequest({ body: { title: "   " } });
      const res = createMockResponse();

      await taskController.createTask(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 500 on database error", async () => {
      mockService.create.mockRejectedValue(new Error("Database error"));
      const req = createMockRequest({
        body: { title: "New Task", description: "New Description" },
      });
      const res = createMockResponse();

      await taskController.createTask(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("updateTask", () => {
    it("should return 200 with updated task", async () => {
      const updatedTask = { ...mockTask, title: "Updated Title" };
      mockService.update.mockResolvedValue(updatedTask);
      const req = createMockRequest({
        params: { id: "1" },
        body: { title: "Updated Title" },
      });
      const res = createMockResponse();

      await taskController.updateTask(req, res);

      expect(mockService.update).toHaveBeenCalledWith(1, {
        title: "Updated Title",
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updatedTask);
    });

    it("should return 404 if task not found", async () => {
      mockService.update.mockRejectedValue(new Error("Task not found"));
      const req = createMockRequest({
        params: { id: "999" },
        body: { title: "Updated Title" },
      });
      const res = createMockResponse();

      await taskController.updateTask(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("should return 400 for invalid task id", async () => {
      const req = createMockRequest({ params: { id: "invalid" } });
      const res = createMockResponse();

      await taskController.updateTask(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 500 on database error", async () => {
      mockService.update.mockRejectedValue(new Error("Database error"));
      const req = createMockRequest({
        params: { id: "1" },
        body: { title: "Updated Title" },
      });
      const res = createMockResponse();

      await taskController.updateTask(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("deleteTask", () => {
    it("should return 204 when task deleted", async () => {
      mockService.remove.mockResolvedValue(mockTask);
      const req = createMockRequest({ params: { id: "1" } });
      const res = createMockResponse();

      await taskController.deleteTask(req, res);

      expect(mockService.remove).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it("should return 404 if task not found", async () => {
      mockService.remove.mockRejectedValue(new Error("Task not found"));
      const req = createMockRequest({ params: { id: "999" } });
      const res = createMockResponse();

      await taskController.deleteTask(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("should return 400 for invalid task id", async () => {
      const req = createMockRequest({ params: { id: "invalid" } });
      const res = createMockResponse();

      await taskController.deleteTask(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 500 on database error", async () => {
      mockService.remove.mockRejectedValue(new Error("Database error"));
      const req = createMockRequest({ params: { id: "1" } });
      const res = createMockResponse();

      await taskController.deleteTask(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
