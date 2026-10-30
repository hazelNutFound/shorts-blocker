const blockingToggle = document.getElementById("blocking-toggle");

async function loadToggle() {
  try {
    const settings = await chrome.storage.local.get(DEFAULT_SETTINGS);
    blockingToggle.checked = settings.blockingEnabled;
    blockingToggle.disabled = false;
  } catch (error) {
    console.error("Shorts Blocker: could not load settings.", error);
    blockingToggle.disabled = true;
  }
}

async function handleToggleChange() {
  try {
    await chrome.storage.local.set({ blockingEnabled: blockingToggle.checked });
  } catch (error) {
    console.error("Shorts Blocker: could not save setting.", error);
    loadToggle();
  }
}

const reminderInput = document.getElementById("reminder-input");
const saveButton = document.getElementById("save-button");

const FEEDBACK_DURATION_MS = 1500;

let feedbackTimer = null;

async function loadReminder() {
  reminderInput.placeholder = DEFAULT_REMINDER;
  try {
    const settings = await chrome.storage.local.get(DEFAULT_SETTINGS);
    reminderInput.value = settings.reminderMessage.trim();
    reminderInput.disabled = false;
    saveButton.disabled = false;
  } catch (error) {
    console.error("Shorts Blocker: could not load reminder.", error);
  }
}

function restoreSaveButton() {
  clearTimeout(feedbackTimer);
  feedbackTimer = null;
  saveButton.textContent = "Save";
  saveButton.disabled = false;
}

function showButtonFeedback(text) {
  saveButton.textContent = text;
  feedbackTimer = setTimeout(restoreSaveButton, FEEDBACK_DURATION_MS);
}

async function handleSaveClick() {
  const trimmedMessage = reminderInput.value.trim();
  saveButton.disabled = true;
  saveButton.textContent = "Saving...";
  reminderInput.disabled = true;

  try {
    await chrome.storage.local.set({ reminderMessage: trimmedMessage });
    reminderInput.value = trimmedMessage;
    showButtonFeedback("✓ Saved!");
  } catch (error) {
    console.error("Shorts Blocker: could not save reminder.", error);
    showButtonFeedback("Not saved");
  }

  reminderInput.disabled = false;
}

function handleReminderInput() {
  if (feedbackTimer !== null) {
    restoreSaveButton();
  }
}

blockingToggle.addEventListener("change", handleToggleChange);
saveButton.addEventListener("click", handleSaveClick);
reminderInput.addEventListener("input", handleReminderInput);

loadToggle();
loadReminder();
