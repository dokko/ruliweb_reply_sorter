// 현재 탭에 토글 메시지 전달
async function sendToggle() {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab?.id) return;
    await chrome.tabs.sendMessage(tab.id, { type: "REPLY_SORTER_TOGGLE" });
  } catch (e) {
    console.error(e);
  }
}

document.getElementById("toggle").addEventListener("click", sendToggle);

// 단축키(Commands) 처리: 팝업은 열려있지 않아도 됨
chrome.commands?.onCommand?.addListener?.((command) => {
  if (command === "toggle-reply-overlay") sendToggle();
});
