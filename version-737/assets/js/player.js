(function () {
    function setupPlayer(player) {
        var video = player.querySelector('.movie-video');
        var button = player.querySelector('[data-play-button]');
        var shell = player.querySelector('.video-shell');
        var source = video ? video.getAttribute('data-source') : '';
        var loaded = false;
        var hls = null;

        if (!video || !source) {
            return;
        }

        function hideButton() {
            if (button) {
                button.classList.add('is-hidden');
            }
        }

        function startPlayback() {
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    if (button) {
                        button.classList.remove('is-hidden');
                    }
                });
            }
        }

        function load() {
            if (loaded) {
                hideButton();
                startPlayback();
                return;
            }

            loaded = true;
            hideButton();

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    startPlayback();
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
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                video.addEventListener('loadedmetadata', startPlayback, { once: true });
            } else {
                video.src = source;
                startPlayback();
            }
        }

        if (button) {
            button.addEventListener('click', load);
        }

        if (shell) {
            shell.addEventListener('click', function (event) {
                if (event.target === button || (button && button.contains(event.target))) {
                    return;
                }
                if (!loaded) {
                    load();
                }
            });
        }

        video.addEventListener('play', hideButton);
    }

    document.querySelectorAll('[data-player]').forEach(setupPlayer);
})();
