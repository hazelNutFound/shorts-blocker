const DEFAULT_SETTINGS = { blockingEnabled: true, reminderMessage: "" };

const DEFAULT_REMINDER = "Stay focused. You've got this.";

const YOUTUBE_HOSTNAMES = ["www.youtube.com", "youtube.com", "m.youtube.com"];

function isShortsUrl(url) {
  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch (error) {
    return false;
  }

  if (!YOUTUBE_HOSTNAMES.includes(parsedUrl.hostname)) {
    return false;
  }

  const pathParts = parsedUrl.pathname.split("/");
  const isShortsPath = pathParts[1] === "shorts";
  const hasVideoId = pathParts[2] !== undefined && pathParts[2] !== "";
  return isShortsPath && hasVideoId;
}

function shouldBlock(url, blockingEnabled) {
  if (blockingEnabled !== true) {
    return false;
  }
  return isShortsUrl(url);
}

function getReminderText(savedMessage) {
  if (typeof savedMessage !== "string") {
    return DEFAULT_REMINDER;
  }

  const trimmedMessage = savedMessage.trim();
  if (trimmedMessage === "") {
    return DEFAULT_REMINDER;
  }
  return trimmedMessage;
}

if (typeof module !== "undefined") {
  module.exports = { isShortsUrl, shouldBlock, getReminderText };
}
