interface PlatformInfo {
  platform?: string;
  userAgent?: string;
}

function getPlatformInfo(): PlatformInfo {
  if (typeof navigator === "undefined") {
    return {};
  }

  return {
    platform: navigator.platform,
    userAgent: navigator.userAgent,
  };
}

export function isMacOS(platformInfo: PlatformInfo = getPlatformInfo()) {
  const platform = platformInfo.platform?.toLowerCase() ?? "";
  const userAgent = platformInfo.userAgent?.toLowerCase() ?? "";

  return platform.includes("mac") || userAgent.includes("mac");
}

export function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  if (target.isContentEditable) {
    return true;
  }

  const editableRoot = target.closest("[contenteditable=''], [contenteditable='true']");
  if (editableRoot instanceof HTMLElement && editableRoot.isContentEditable) {
    return true;
  }

  return ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

export function matchesPlatformShortcut(event: KeyboardEvent, key: string) {
  if (isEditableTarget(event.target)) {
    return false;
  }

  const normalizedKey = key.toLowerCase();
  const modifierMatches = isMacOS()
    ? event.metaKey && !event.ctrlKey
    : event.ctrlKey && !event.metaKey;

  return (
    !event.altKey && !event.shiftKey && modifierMatches && event.key.toLowerCase() === normalizedKey
  );
}

export function getPlatformShortcutLabel(key: string) {
  return isMacOS() ? `⌘${key.toUpperCase()}` : `Ctrl+${key.toUpperCase()}`;
}
