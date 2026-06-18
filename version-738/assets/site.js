(function () {
    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
            toggle.textContent = nav.classList.contains("is-open") ? "×" : "☰";
        });
    }

    function initHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle("is-active", itemIndex === index);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle("is-active", itemIndex === index);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                stop();
                show(dotIndex);
                start();
            });
        });
        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        start();
    }

    function initFilters() {
        var panel = document.querySelector("[data-filter-panel]");
        var grid = document.querySelector("[data-card-grid]");
        if (!panel || !grid) {
            return;
        }
        var input = panel.querySelector("[data-filter-input]");
        var region = panel.querySelector("[data-filter-region]");
        var type = panel.querySelector("[data-filter-type]");
        var year = panel.querySelector("[data-filter-year]");
        var empty = document.querySelector("[data-empty-state]");
        var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q");
        if (initial && input) {
            input.value = initial;
        }
        function match(card) {
            var query = normalize(input && input.value);
            var regionValue = normalize(region && region.value);
            var typeValue = normalize(type && type.value);
            var yearValue = normalize(year && year.value);
            var haystack = normalize([
                card.dataset.title,
                card.dataset.region,
                card.dataset.type,
                card.dataset.year,
                card.dataset.tags,
                card.dataset.category,
                card.textContent
            ].join(" "));
            if (query && haystack.indexOf(query) === -1) {
                return false;
            }
            if (regionValue && normalize(card.dataset.region) !== regionValue) {
                return false;
            }
            if (typeValue && normalize(card.dataset.type) !== typeValue) {
                return false;
            }
            if (yearValue && normalize(card.dataset.year) !== yearValue) {
                return false;
            }
            return true;
        }
        function apply() {
            var count = 0;
            cards.forEach(function (card) {
                var visible = match(card);
                card.style.display = visible ? "" : "none";
                if (visible) {
                    count += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", count === 0);
            }
        }
        [input, region, type, year].forEach(function (control) {
            if (!control) {
                return;
            }
            control.addEventListener("input", apply);
            control.addEventListener("change", apply);
        });
        apply();
    }

    initMenu();
    initHero();
    initFilters();
})();
