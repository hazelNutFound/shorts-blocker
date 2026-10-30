let blockingEnabled = false;
let reminderText = getReminderText("");

const OVERLAY_ID = "shorts-blocker-overlay";

const YOUTUBE_HOME_URL = "https://www.youtube.com/";

const HOME_BUTTON_RESET_MS = 5000;

function restoreHomeButton(button) {
  button.disabled = false;
  button.classList.remove("sb-is-loading");
  button.textContent = "Back to YouTube";
}

function goToYouTubeHome(event) {
  const button = event.currentTarget;
  button.disabled = true;
  button.classList.add("sb-is-loading");
  button.textContent = "Going back...";
  setTimeout(() => restoreHomeButton(button), HOME_BUTTON_RESET_MS);
  window.location.href = YOUTUBE_HOME_URL;
}

// A page restored from the back/forward cache keeps the old "Going back..." button state.
function handlePageShow(event) {
  if (!event.persisted) {
    return;
  }
  const button = document.querySelector("#" + OVERLAY_ID + " .sb-button");
  if (button) {
    restoreHomeButton(button);
  }
}

function createOverlay(message) {
  const overlay = document.createElement("div");
  overlay.id = OVERLAY_ID;
  overlay.className = "sb-overlay";

  const card = document.createElement("div");
  card.className = "sb-card";

  const icon = document.createElement("div");
  icon.className = "sb-icon";
  icon.setAttribute("aria-hidden", "true");
  card.appendChild(icon);

  const heading = document.createElement("h1");
  heading.className = "sb-heading";
  heading.textContent = "Shorts blocked";

  const messageText = document.createElement("p");
  messageText.className = "sb-message";
  messageText.textContent = message;

  const homeButton = document.createElement("button");
  homeButton.type = "button";
  homeButton.className = "sb-button";
  homeButton.textContent = "Back to YouTube";
  homeButton.addEventListener("click", goToYouTubeHome);

  card.appendChild(heading);
  card.appendChild(messageText);
  card.appendChild(homeButton);
  overlay.appendChild(card);
  return overlay;
}

function pauseAllVideos() {
  const videos = document.querySelectorAll("video");
  for (const video of videos) {
    video.pause();
  }
}

function handleVideoPlay(event) {
  if (event.target.tagName === "VIDEO") {
    event.target.pause();
  }
}

function showOverlay() {
  if (document.getElementById(OVERLAY_ID)) {
    return;
  }

  // "play" does not bubble, so listen in the capture phase (the "true" argument)
  document.addEventListener("play", handleVideoPlay, true);
  pauseAllVideos();

  // At document_start the <body> may not exist yet, so add the overlay once the DOM is ready.
  if (!document.body) {
    document.addEventListener("DOMContentLoaded", updateBlocking, { once: true });
    return;
  }

  const overlay = createOverlay(reminderText);
  document.body.appendChild(overlay);
}

function removeOverlay() {
  document.removeEventListener("play", handleVideoPlay, true);

  const overlay = document.getElementById(OVERLAY_ID);
  if (overlay) {
    overlay.remove();
  }
}

function updateBlocking() {
  if (shouldBlock(window.location.href, blockingEnabled)) {
    showOverlay();
  } else {
    removeOverlay();
  }
}

function handleAnyVideoPlay(event) {
  if (!shouldBlock(window.location.href, blockingEnabled)) {
    return;
  }
  if (event.target.tagName === "VIDEO") {
    event.target.pause();
  }
  updateBlocking();
}

function updateOverlayMessage() {
  const messageText = document.querySelector("#" + OVERLAY_ID + " .sb-message");
  if (messageText) {
    messageText.textContent = reminderText;
  }
}

async function loadSettings() {
  try {
    const settings = await chrome.storage.local.get(DEFAULT_SETTINGS);
    blockingEnabled = settings.blockingEnabled;
    reminderText = getReminderText(settings.reminderMessage);
  } catch (error) {
    console.error("Shorts Blocker: could not load settings.", error);
    blockingEnabled = false;
  }

  updateOverlayMessage();
  updateBlocking();
}

function handleStorageChange(changes, areaName) {
  if (areaName !== "local") {
    return;
  }
  loadSettings();
}

// YouTube changes pages without reloading, so check again after each in-page navigation.
// Note: "yt-navigate-finish" is YouTube's own event, not an official API, and could change.
// It can fire 2–3 s after a Short starts playing, so every video play is checked too.
document.addEventListener("yt-navigate-finish", updateBlocking);
document.addEventListener("play", handleAnyVideoPlay, true);

window.addEventListener("popstate", updateBlocking);
window.addEventListener("pageshow", handlePageShow);

chrome.storage.onChanged.addListener(handleStorageChange);

loadSettings();
