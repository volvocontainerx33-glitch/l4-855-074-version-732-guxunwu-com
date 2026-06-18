document.addEventListener("DOMContentLoaded", function () {
    initMobileNav();
    initSearchBoxes();
    initHero();
    initFilters();
    initPlayer();
});

function initMobileNav() {
    const toggle = document.querySelector("[data-mobile-toggle]");
    const panel = document.querySelector("[data-mobile-panel]");

    if (!toggle || !panel) {
        return;
    }

    toggle.addEventListener("click", function () {
        panel.classList.toggle("is-open");
    });
}

function initSearchBoxes() {
    const boxes = document.querySelectorAll("[data-search-box]");

    boxes.forEach(function (box) {
        const input = box.querySelector("[data-search-input]");
        const panel = box.querySelector("[data-search-results]");

        if (!input || !panel || typeof MOVIE_INDEX === "undefined") {
            return;
        }

        input.addEventListener("input", function () {
            const query = input.value.trim().toLowerCase();

            if (!query) {
                panel.classList.remove("is-open");
                panel.innerHTML = "";
                return;
            }

            const results = MOVIE_INDEX.filter(function (item) {
                const text = [
                    item.title,
                    item.line,
                    item.year,
                    item.category,
                    item.type,
                    (item.tags || []).join(" ")
                ].join(" ").toLowerCase();

                return text.indexOf(query) !== -1;
            }).slice(0, 8);

            if (!results.length) {
                panel.innerHTML = '<a href="./all.html"><strong>没有找到匹配内容</strong><span>进入全部影片继续浏览</span></a>';
                panel.classList.add("is-open");
                return;
            }

            panel.innerHTML = results.map(function (item) {
                return [
                    '<a href="' + item.url + '">',
                    '<strong>' + escapeHtml(item.title) + '</strong>',
                    '<span>' + escapeHtml(item.year + " · " + item.category + " · " + item.line) + '</span>',
                    '</a>'
                ].join("");
            }).join("");

            panel.classList.add("is-open");
        });

        document.addEventListener("click", function (event) {
            if (!box.contains(event.target)) {
                panel.classList.remove("is-open");
            }
        });
    });
}

function initHero() {
    const hero = document.querySelector("[data-hero]");
    if (!hero) {
        return;
    }

    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    let current = 0;

    function show(index) {
        current = index;
        slides.forEach(function (slide, i) {
            slide.classList.toggle("is-active", i === current);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle("is-active", i === current);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
            show(index);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            show((current + 1) % slides.length);
        }, 5000);
    }
}

function initFilters() {
    const bar = document.querySelector("[data-filter-bar]");
    if (!bar) {
        return;
    }

    const cards = Array.from(document.querySelectorAll("[data-title]"));
    const search = bar.querySelector("[data-filter-search]");
    const year = bar.querySelector("[data-filter-year]");
    const type = bar.querySelector("[data-filter-type]");
    const empty = document.querySelector("[data-empty-state]");

    function apply() {
        const q = search ? search.value.trim().toLowerCase() : "";
        const y = year ? year.value : "";
        const t = type ? type.value : "";
        let visible = 0;

        cards.forEach(function (card) {
            const text = [
                card.getAttribute("data-title") || "",
                card.getAttribute("data-tags") || "",
                card.getAttribute("data-year") || "",
                card.getAttribute("data-type") || ""
            ].join(" ").toLowerCase();

            const okText = !q || text.indexOf(q) !== -1;
            const okYear = !y || (card.getAttribute("data-year") || "") === y;
            const okType = !t || (card.getAttribute("data-type") || "") === t;
            const show = okText && okYear && okType;

            card.style.display = show ? "" : "none";
            if (show) {
                visible += 1;
            }
        });

        if (empty) {
            empty.classList.toggle("is-visible", visible === 0);
        }
    }

    [search, year, type].forEach(function (el) {
        if (el) {
            el.addEventListener("input", apply);
            el.addEventListener("change", apply);
        }
    });
}

function initPlayer() {
    const boxes = document.querySelectorAll("[data-player]");

    boxes.forEach(function (box) {
        const video = box.querySelector("video");
        const cover = box.querySelector(".player-cover");

        if (!video || !cover) {
            return;
        }

        const stream = video.getAttribute("data-stream");

        function start() {
            if (!stream) {
                return;
            }

            cover.classList.add("is-hidden");
            video.setAttribute("controls", "controls");

            if (!video.dataset.ready) {
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                } else if (window.Hls && Hls.isSupported()) {
                    const hls = new Hls();
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    video.dataset.hlsAttached = "1";
                } else {
                    video.src = stream;
                }

                video.dataset.ready = "1";
            }

            const played = video.play();

            if (played && typeof played.catch === "function") {
                played.catch(function () {});
            }
        }

        cover.addEventListener("click", start);
        video.addEventListener("click", function () {
            if (!video.dataset.ready) {
                start();
            }
        });
    });
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
