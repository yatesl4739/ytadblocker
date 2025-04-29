
/*  Replace the normal player with the silent hover-preview stream  */

(function () {
  // Utility – extract the eleven-char video ID from URL
  const idFromURL = url => {
    const m = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    return m ? m[1] : null;
  };

  // Build the “an_webp” hover-preview URL pattern
  const previewURL = videoId =>
    `https://i.ytimg.com/an_webp/${videoId}/mqdefault_6s.webp?du=1000`;

  // Wait until YouTube’s player container is present
  const waitForPlayer = () =>
    new Promise(resolve => {
      const el = document.getElementById("player");
      if (el) return resolve(el);
      const obs = new MutationObserver(() => {
        const p = document.getElementById("player");
        if (p) {
          obs.disconnect();
          resolve(p);
        }
      });
      obs.observe(document.body, { childList: true, subtree: true });
    });

  async function run() {
    const videoId = idFromURL(location.href);
    if (!videoId) return;

    const player = await waitForPlayer();

    // Hide the original player (keep it to satisfy YouTube’s JS)
    player.style.display = "none";

    // Create overlay wrapper
    const wrap = document.createElement("div");
    wrap.id = "ypn-overlay";
    document.body.appendChild(wrap);

    // Build <video> element
    const vid = document.createElement("video");
    vid.src = previewURL(videoId);
    vid.autoplay = true;
    vid.loop = true;
    vid.controls = true;          // basic UI
    vid.muted = true;             // preview has no audio anyway
    wrap.appendChild(vid);

    // Esc key or X button restores original player
    const close = () => {
      wrap.remove();
      player.style.display = "";  // back to normal
    };
    document.addEventListener("keydown", e => e.key === "Escape" && close());

    const btn = document.createElement("button");
    btn.textContent = "×";
    btn.id = "ypn-close";
    btn.onclick = close;
    wrap.appendChild(btn);
  }

  run();
})();
