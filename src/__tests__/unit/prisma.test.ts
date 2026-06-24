import { describe, it, expect } from "vitest";
import prisma from "../../lib/prisma.js";

describe("Prisma", () => {
  it("should export prisma client", () => {
    expect(prisma).toBeDefined();
    expect(prisma.task).toBeDefined();
  });
});
