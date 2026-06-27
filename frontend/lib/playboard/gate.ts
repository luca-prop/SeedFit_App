export function isPlayBoardEnabled() {
  if (process.env.NODE_ENV !== "production") {
    return true;
  }

  return process.env.PLAYBOARD_ENABLED === "true";
}

