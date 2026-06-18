var MoviePlayer = (function () {
  function boot(streamUrl) {
    var video = document.querySelector("[data-player-video]");
    var trigger = document.querySelector("[data-player-trigger]");
    var shell = document.querySelector(".player-shell");
    var prepared = false;
    var hlsInstance = null;

    if (!video || !streamUrl) {
      return;
    }

    function prepare() {
      if (prepared) {
        return;
      }

      prepared = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function play() {
      prepare();
      video.controls = true;
      if (trigger) {
        trigger.classList.add("is-hidden");
      }
      if (shell) {
        shell.classList.add("is-playing");
      }
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {});
      }
    }

    if (trigger) {
      trigger.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  return {
    boot: boot
  };
})();
