import { describe, it, expect } from "vitest";
import app from "../../app.js";

describe("App", () => {
  it("should be an express app", () => {
    expect(app).toBeDefined();
    expect(typeof app).toBe("function");
  });

  it("should have express methods", () => {
    expect(typeof app.use).toBe("function");
    expect(typeof app.listen).toBe("function");
    expect(typeof app.get).toBe("function");
  });
});
