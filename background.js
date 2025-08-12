chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "toggle-reply-overlay") return;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;
  chrome.tabs.sendMessage(tab.id, { type: "REPLY_SORTER_TOGGLE" });
});
