(function () {
    var mobileButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (mobileButton && mobileNav) {
        mobileButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var activeSlide = 0;
    var heroTimer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        activeSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, currentIndex) {
            slide.classList.toggle('active', currentIndex === activeSlide);
        });
        dots.forEach(function (dot, currentIndex) {
            dot.classList.toggle('active', currentIndex === activeSlide);
        });
    }

    function startHero() {
        if (slides.length < 2) {
            return;
        }
        heroTimer = window.setInterval(function () {
            showSlide(activeSlide + 1);
        }, 5200);
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            if (heroTimer) {
                window.clearInterval(heroTimer);
            }
            showSlide(index);
            startHero();
        });
    });

    showSlide(0);
    startHero();

    var queryFromUrl = new URLSearchParams(window.location.search).get('q') || '';
    var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
    var movieCards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var emptyState = document.querySelector('[data-empty-state]');

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function runFilter() {
        if (!movieCards.length) {
            return;
        }
        var value = normalize(searchInputs.map(function (input) {
            return input.value;
        }).filter(Boolean)[0]);
        var visible = 0;
        movieCards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-tags'),
                card.getAttribute('data-year')
            ].join(' '));
            var matched = !value || haystack.indexOf(value) !== -1;
            card.style.display = matched ? '' : 'none';
            if (matched) {
                visible += 1;
            }
        });
        if (emptyState) {
            emptyState.classList.toggle('show', visible === 0);
        }
    }

    searchInputs.forEach(function (input) {
        if (queryFromUrl && !input.value) {
            input.value = queryFromUrl;
        }
        input.addEventListener('input', runFilter);
    });

    runFilter();

    function connectVideo(video, source) {
        if (video.getAttribute('data-ready') === '1') {
            return;
        }
        video.setAttribute('data-ready', '1');
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            video.hlsInstance = hls;
            return;
        }
        video.src = source;
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (player) {
        var video = player.querySelector('video');
        var overlay = player.querySelector('[data-player-overlay]');
        var source = player.getAttribute('data-video');

        if (!video || !source) {
            return;
        }

        function playMovie() {
            connectVideo(video, source);
            if (overlay) {
                overlay.classList.add('hidden');
            }
            video.setAttribute('controls', 'controls');
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener('click', playMovie);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                playMovie();
            }
        });
    });
})();
