import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SidebarProvider, useSidebar } from "./sidebar-provider";

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

function SidebarState() {
  const { open } = useSidebar();

  return <span>{open ? "open" : "closed"}</span>;
}

describe("SidebarProvider", () => {
  beforeEach(() => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 768,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("toggles the sidebar with Meta+B on macOS", async () => {
    mockPlatform("MacIntel", "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0)");
    render(
      <SidebarProvider>
        <SidebarState />
      </SidebarProvider>,
    );

    await waitFor(() => expect(screen.getByText("closed")).toBeInTheDocument());

    fireEvent.keyDown(document, { key: "b", metaKey: true });
    expect(screen.getByText("open")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "b", ctrlKey: true });
    expect(screen.getByText("open")).toBeInTheDocument();
  });

  it("toggles the sidebar with Ctrl+B on Windows/Linux", async () => {
    mockPlatform("Win32", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
    render(
      <SidebarProvider>
        <SidebarState />
      </SidebarProvider>,
    );

    await waitFor(() => expect(screen.getByText("closed")).toBeInTheDocument());

    fireEvent.keyDown(document, { key: "b", ctrlKey: true });
    expect(screen.getByText("open")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "b", metaKey: true });
    expect(screen.getByText("open")).toBeInTheDocument();
  });

  it("removes the keydown listener on unmount", () => {
    mockPlatform("MacIntel", "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0)");
    const addEventListenerSpy = vi.spyOn(document, "addEventListener");
    const removeEventListenerSpy = vi.spyOn(document, "removeEventListener");

    const { unmount } = render(
      <SidebarProvider>
        <SidebarState />
      </SidebarProvider>,
    );
    const keydownHandler = addEventListenerSpy.mock.calls.find(([type]) => type === "keydown")?.[1];

    unmount();

    expect(keydownHandler).toBeTypeOf("function");
    expect(removeEventListenerSpy).toHaveBeenCalledWith("keydown", keydownHandler);
  });
});
