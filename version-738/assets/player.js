(function () {
    window.setupMoviePlayer = function (options) {
        var video = document.getElementById("movie-video");
        var overlay = document.getElementById("play-overlay");
        var stream = options && options.stream;
        var hls = null;
        var ready = false;

        function hideOverlay() {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        }

        function playVideo() {
            if (!video) {
                return;
            }
            var result = video.play();
            if (result && typeof result.catch === "function") {
                result.catch(function () {});
            }
        }

        function attachStream() {
            if (!video || !stream) {
                return;
            }
            if (ready) {
                playVideo();
                return;
            }
            ready = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
                video.load();
                playVideo();
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MEDIA_ATTACHED, function () {
                    hls.loadSource(stream);
                });
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    playVideo();
                });
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        hls.destroy();
                    }
                });
                return;
            }
            video.src = stream;
            video.load();
            playVideo();
        }

        function start() {
            hideOverlay();
            attachStream();
        }

        if (overlay) {
            overlay.addEventListener("click", start);
        }
        if (video) {
            video.addEventListener("click", function () {
                if (video.paused) {
                    start();
                }
            });
            video.addEventListener("play", hideOverlay);
        }
        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };
})();
