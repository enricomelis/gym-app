import { describe, expect, it } from "vitest";

import { isEditableTarget, isMacOS, matchesPlatformShortcut } from "@/lib/keyboard-shortcuts";

function mockPlatform(platform: string, userAgent: string) {
  Object.defineProperty(window.navigator, "platform", {
    configurable: true,
    value: platform,
  });
  Object.defineProperty(window.navigator, "userAgent", {
    configurable: true,
    value: userAgent,
  });
}

describe("keyboard-shortcuts", () => {
  it("recognizes macOS platforms", () => {
    expect(isMacOS({ platform: "MacIntel" })).toBe(true);
    expect(isMacOS({ platform: "Win32", userAgent: "Mozilla/5.0 (X11; Linux x86_64)" })).toBe(
      false,
    );
  });

  it("matches Meta shortcuts only on macOS", () => {
    mockPlatform("MacIntel", "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0)");

    expect(
      matchesPlatformShortcut(new KeyboardEvent("keydown", { key: "b", metaKey: true }), "b"),
    ).toBe(true);
    expect(
      matchesPlatformShortcut(new KeyboardEvent("keydown", { key: "b", ctrlKey: true }), "b"),
    ).toBe(false);
  });

  it("matches Ctrl shortcuts only on Windows and Linux", () => {
    mockPlatform("Win32", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)");

    expect(
      matchesPlatformShortcut(new KeyboardEvent("keydown", { key: "b", ctrlKey: true }), "b"),
    ).toBe(true);
    expect(
      matchesPlatformShortcut(new KeyboardEvent("keydown", { key: "b", metaKey: true }), "b"),
    ).toBe(false);
  });

  it("ignores shortcuts triggered from editable targets", () => {
    mockPlatform("MacIntel", "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0)");

    const input = document.createElement("input");
    const event = new KeyboardEvent("keydown", { key: "b", metaKey: true });
    Object.defineProperty(event, "target", { configurable: true, value: input });

    expect(isEditableTarget(input)).toBe(true);
    expect(matchesPlatformShortcut(event, "b")).toBe(false);
  });

  it("ignores non-editable targets", () => {
    const container = document.createElement("div");
    const child = document.createElement("span");
    container.append(child);

    expect(isEditableTarget(child)).toBe(false);
  });
});
