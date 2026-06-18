(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('open');
        });
    }

    document.querySelectorAll('.poster-frame img').forEach(function (img) {
        if (img.complete && img.naturalWidth === 0) {
            var frame = img.closest('.poster-frame');
            if (frame) {
                frame.classList.add('is-missing');
            }
            img.remove();
        }
    });

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                restart();
            });
        }

        showSlide(0);
        restart();
    }

    function setupMovieGrid(root) {
        var grid = root.querySelector('[data-card-grid]');
        var input = root.querySelector('.movie-filter-input');
        var sort = root.querySelector('.movie-sort-select');
        var empty = root.querySelector('[data-empty-state]');
        var buttons = Array.prototype.slice.call(root.querySelectorAll('[data-filter-button]'));

        if (!grid) {
            return;
        }

        var cards = Array.prototype.slice.call(grid.querySelectorAll('.js-movie-card'));
        var activeFilter = 'all';

        function textOf(card) {
            return [
                card.getAttribute('data-title') || '',
                card.getAttribute('data-tags') || '',
                card.getAttribute('data-year') || '',
                card.getAttribute('data-region') || '',
                card.getAttribute('data-type') || ''
            ].join(' ').toLowerCase();
        }

        function apply() {
            var query = input ? input.value.trim().toLowerCase() : '';
            var visibleCount = 0;

            cards.forEach(function (card) {
                var haystack = textOf(card);
                var matchesText = !query || haystack.indexOf(query) !== -1;
                var matchesFilter = activeFilter === 'all' || haystack.indexOf(activeFilter.toLowerCase()) !== -1;
                var visible = matchesText && matchesFilter;

                card.classList.toggle('is-hidden-card', !visible);
                if (visible) {
                    visibleCount += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('show', visibleCount === 0);
            }
        }

        function sortCards() {
            if (!sort) {
                return;
            }

            var value = sort.value;
            var sorted = cards.slice();

            if (value === 'rating') {
                sorted.sort(function (a, b) {
                    return Number(b.getAttribute('data-rating') || 0) - Number(a.getAttribute('data-rating') || 0);
                });
            } else if (value === 'views') {
                sorted.sort(function (a, b) {
                    return Number(b.getAttribute('data-views') || 0) - Number(a.getAttribute('data-views') || 0);
                });
            } else if (value === 'year') {
                sorted.sort(function (a, b) {
                    return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
                });
            } else {
                sorted.sort(function (a, b) {
                    return cards.indexOf(a) - cards.indexOf(b);
                });
            }

            sorted.forEach(function (card) {
                grid.appendChild(card);
            });
        }

        if (input) {
            var params = new URLSearchParams(window.location.search);
            var q = params.get('q');
            if (q && input.hasAttribute('data-search-query')) {
                input.value = q;
            }
            input.addEventListener('input', apply);
        }

        if (sort) {
            sort.addEventListener('change', function () {
                sortCards();
                apply();
            });
        }

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                activeFilter = button.getAttribute('data-filter-button') || 'all';
                buttons.forEach(function (item) {
                    item.classList.toggle('active', item === button);
                });
                apply();
            });
        });

        apply();
    }

    setupMovieGrid(document);
})();
