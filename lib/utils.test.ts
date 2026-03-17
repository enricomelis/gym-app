import { cn } from "@/lib/utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1");
  });

  it("handles conditional classes", () => {
    const condition = false;
    expect(cn("px-2", condition && "py-1")).toBe("px-2");
  });

  it("merges conflicting tailwind classes", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
});
