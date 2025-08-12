(() => {
  const OVERLAY_ID = "reply-sorter-overlay";
  const BTN_ID = "reply-sorter-close";

  function parseReplyCount(text) {
    // 예: "[139]" → 139
    const m = String(text || "").match(/\d+/);
    return m ? parseInt(m[0], 10) : 0;
  }

  function extractItems() {
    // 페이지에 해당 구조가 없으면 빈 배열
    const nodes = document.querySelectorAll(".bottom_list_item");
    if (!nodes || nodes.length === 0) return [];

    return (
      [...nodes]
        .map((item) => {
          // 1. 먼저 subject_text 시도
          let titleEl = item.querySelector(".subject_text");
          // 2. 없으면 a.subject.deco 사용
          if (!titleEl) titleEl = item.querySelector("a.subject.deco");

          const linkEl = item.querySelector("a.subject.deco");
          const replyEl = item.querySelector(".num_reply");

          return {
            title: titleEl ? titleEl.innerText.trim() : "",
            link: linkEl ? linkEl.href : "",
            replies: replyEl
              ? parseInt(replyEl.innerText.replace(/\D/g, ""), 10)
              : 0,
          };
        })
        .filter((it) => it.replies >= 10)
        // 제목 중복 제거
        .filter(
          (item, index, self) =>
            index === self.findIndex((t) => t.title === item.title)
        )
        .sort((a, b) => b.replies - a.replies)
    );
  }

  function removeOverlay() {
    const el = document.getElementById(OVERLAY_ID);
    if (el) el.remove();
  }

  function createOverlay(items) {
    removeOverlay();

    const overlay = document.createElement("div");
    overlay.id = OVERLAY_ID;
    Object.assign(overlay.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "50%",
      height: "50%",
      background: "rgba(0,0,0,0.85)",
      color: "#fff",
      zIndex: "2147483647", // 최상단
      overflowY: "auto",
      padding: "16px 20px",
      fontSize: "15px",
      lineHeight: "1.6",
      boxShadow: "2px 0 8px rgba(0,0,0,0.5)",
      backdropFilter: "saturate(120%) blur(2px)",
    });

    // 닫기 버튼 (sticky)
    const closeBtn = document.createElement("button");
    closeBtn.id = BTN_ID;
    closeBtn.textContent = "닫기 ✖";
    Object.assign(closeBtn.style, {
      position: "sticky",
      top: "0",
      left: "100%",
      transform: "translateX(-120%)",
      background: "#444",
      border: "none",
      color: "#fff",
      padding: "8px 12px",
      fontSize: "14px",
      cursor: "pointer",
      zIndex: "2147483647",
      borderRadius: "6px",
    });
    closeBtn.addEventListener("click", removeOverlay);

    const header = document.createElement("div");
    header.style.position = "sticky";
    header.style.top = "0";
    header.style.background = "rgba(0,0,0,0.85)";
    header.style.paddingBottom = "8px";
    header.style.marginBottom = "8px";
    header.style.display = "flex";
    header.style.alignItems = "center";
    header.style.gap = "8px";

    const title = document.createElement("div");
    title.textContent = `댓글 10+ 링크 (${items.length}개)`;
    title.style.fontWeight = "700";

    // 새로고침 버튼
    const refreshBtn = document.createElement("button");
    refreshBtn.textContent = "새로고침";
    Object.assign(refreshBtn.style, {
      background: "#555",
      border: "none",
      color: "#fff",
      padding: "6px 10px",
      fontSize: "13px",
      cursor: "pointer",
      borderRadius: "6px",
    });
    refreshBtn.addEventListener("click", () => {
      const updated = extractItems();
      renderList(list, updated);
      title.textContent = `댓글 10+ 링크 (${updated.length}개)`;
    });

    header.appendChild(title);
    header.appendChild(refreshBtn);
    header.appendChild(closeBtn);

    const list = document.createElement("div");
    list.style.marginTop = "6px";

    function renderList(container, items) {
      if (!items || items.length === 0) {
        container.innerHTML =
          '<div style="opacity:0.8">조건에 맞는 항목이 없습니다.</div>';
        return;
      }
      container.innerHTML = items
        .map(
          (item) =>
            `<div style="margin:6px 0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
           <a href="${
             item.link
           }" target="_blank" style="color:skyblue; text-decoration:none;">
             [${item.replies}] ${item.title.replace(/[\"<>]/g, "")}
           </a>
         </div>`
        )
        .join("");
    }

    renderList(list, items);

    overlay.appendChild(header);
    overlay.appendChild(list);
    document.body.appendChild(overlay);
  }

  function toggleOverlay() {
    const existing = document.getElementById(OVERLAY_ID);
    if (existing) {
      removeOverlay();
      return;
    }
    const items = extractItems();
    createOverlay(items);
  }

  // 팝업/단축키에서 보내는 메시지 수신
  chrome.runtime?.onMessage?.addListener((msg) => {
    if (!msg) return;
    if (msg.type === "REPLY_SORTER_TOGGLE") toggleOverlay();
  });

  // 페이지 내에서 수동 테스트용: window에 노출 (선택)
  window.__replySorterToggle = toggleOverlay;
})();
