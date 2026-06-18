(function () {
  const player = document.querySelector("[data-player]");

  if (!player) {
    return;
  }

  const video = player.querySelector("video");
  const overlay = player.querySelector("[data-play-overlay]");
  const button = player.querySelector("[data-play-button]");
  const sourceUrl = player.getAttribute("data-src");
  let attached = false;
  let hlsInstance = null;

  function attachSource() {
    if (attached || !video || !sourceUrl) {
      return;
    }

    attached = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sourceUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(sourceUrl);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = sourceUrl;
  }

  function startPlayback(event) {
    if (event) {
      event.preventDefault();
    }

    attachSource();

    if (overlay) {
      overlay.classList.add("is-hidden");
    }

    if (video) {
      video.controls = true;
      const playPromise = video.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }
  }

  if (button) {
    button.addEventListener("click", startPlayback);
  }

  if (overlay) {
    overlay.addEventListener("click", startPlayback);
  }

  if (video) {
    video.addEventListener("click", function () {
      if (video.paused) {
        startPlayback();
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
})();
