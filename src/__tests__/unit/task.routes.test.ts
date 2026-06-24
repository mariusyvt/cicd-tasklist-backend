import { describe, it, expect } from "vitest";
import taskRoutes from "../../routes/task.routes.js";

describe("Task Routes", () => {
  it("should be a router", () => {
    expect(taskRoutes).toBeDefined();
    expect(taskRoutes.stack).toBeDefined();
    expect(taskRoutes.stack.length).toBe(5); // GET, GET/:id, POST, PUT, DELETE
  });
});
