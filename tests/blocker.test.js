const test = require("node:test");
const assert = require("node:assert");
const { isShortsUrl, shouldBlock, getReminderText } = require("../blocker.js");

const DEFAULT_REMINDER = "Stay focused. You've got this.";

test("isShortsUrl recognizes a normal Shorts URL", () => {
  assert.strictEqual(isShortsUrl("https://www.youtube.com/shorts/abc123"), true);
});

test("isShortsUrl recognizes Shorts URL variations", () => {
  assert.strictEqual(isShortsUrl("https://www.youtube.com/shorts/abc123?feature=share"), true);
  assert.strictEqual(isShortsUrl("https://www.youtube.com/shorts/abc123/"), true);
  assert.strictEqual(isShortsUrl("https://m.youtube.com/shorts/abc123"), true);
  assert.strictEqual(isShortsUrl("https://youtube.com/shorts/abc123"), true);
});

test("isShortsUrl returns false for normal YouTube pages", () => {
  assert.strictEqual(isShortsUrl("https://www.youtube.com/watch?v=abc123"), false);
  assert.strictEqual(isShortsUrl("https://www.youtube.com/"), false);
  assert.strictEqual(isShortsUrl("https://www.youtube.com/results?search_query=shorts"), false);
  assert.strictEqual(isShortsUrl("https://www.youtube.com/@channelname/shorts"), false);
});

test("isShortsUrl returns false for non-YouTube and invalid URLs", () => {
  assert.strictEqual(isShortsUrl("https://www.example.com/shorts/abc123"), false);
  assert.strictEqual(isShortsUrl("not a url"), false);
  assert.strictEqual(isShortsUrl(""), false);
});

test("shouldBlock returns true for a Shorts URL when blocking is enabled", () => {
  assert.strictEqual(shouldBlock("https://www.youtube.com/shorts/abc123", true), true);
});

test("shouldBlock returns false when blocking is disabled", () => {
  assert.strictEqual(shouldBlock("https://www.youtube.com/shorts/abc123", false), false);
});

test("shouldBlock returns false for a normal video even when enabled", () => {
  assert.strictEqual(shouldBlock("https://www.youtube.com/watch?v=abc123", true), false);
});

test("getReminderText returns the default for empty or whitespace input", () => {
  assert.strictEqual(getReminderText(""), DEFAULT_REMINDER);
  assert.strictEqual(getReminderText("   "), DEFAULT_REMINDER);
});

test("getReminderText returns the default when no message is passed", () => {
  assert.strictEqual(getReminderText(undefined), DEFAULT_REMINDER);
});

test("getReminderText returns the trimmed saved message", () => {
  assert.strictEqual(getReminderText("  Go read a book  "), "Go read a book");
});
