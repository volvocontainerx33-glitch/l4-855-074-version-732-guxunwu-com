(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
    } else {
      document.addEventListener("DOMContentLoaded", callback);
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initMenu() {
    var button = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      var open = panel.classList.toggle("is-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initHero() {
    var hero = document.querySelector(".hero");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    if (!slides.length) {
      return;
    }
    var current = 0;
    function show(index) {
      current = index;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
      });
    });
    window.setInterval(function () {
      show((current + 1) % slides.length);
    }, 5000);
  }

  function initHeaderSearch() {
    var forms = Array.prototype.slice.call(document.querySelectorAll(".header-search"));
    forms.forEach(function (form) {
      var input = form.querySelector(".global-search-input");
      var box = form.querySelector(".search-suggestions");
      if (!input || !box) {
        return;
      }
      function clear() {
        box.innerHTML = "";
        box.classList.remove("is-visible");
      }
      input.addEventListener("input", function () {
        var query = normalize(input.value);
        if (!query || !window.SEARCH_ITEMS) {
          clear();
          return;
        }
        var items = window.SEARCH_ITEMS.filter(function (item) {
          return normalize(item.title + " " + item.oneLine + " " + item.category + " " + item.genre + " " + item.tags).indexOf(query) !== -1;
        }).slice(0, 8);
        if (!items.length) {
          clear();
          return;
        }
        box.innerHTML = items.map(function (item) {
          return '<a href="' + item.href + '"><strong>' + item.title + '</strong><span>' + item.oneLine + '</span></a>';
        }).join("");
        box.classList.add("is-visible");
      });
      document.addEventListener("click", function (event) {
        if (!form.contains(event.target)) {
          clear();
        }
      });
    });
  }

  function initFilters() {
    var search = document.getElementById("pageSearch");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var buttons = Array.prototype.slice.call(document.querySelectorAll(".filter-btn"));
    var empty = document.querySelector(".no-results");
    if (!cards.length) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    if (search && params.get("q")) {
      search.value = params.get("q");
    }
    function currentFilter() {
      var active = document.querySelector(".filter-btn.active");
      return active ? active.getAttribute("data-filter") : "all";
    }
    function apply() {
      var query = normalize(search ? search.value : "");
      var filter = currentFilter();
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags")
        ].join(" "));
        var category = card.getAttribute("data-category");
        var matchedQuery = !query || haystack.indexOf(query) !== -1;
        var matchedFilter = filter === "all" || filter === category;
        var matched = matchedQuery && matchedFilter;
        card.classList.toggle("is-hidden", !matched);
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }
    if (search) {
      search.addEventListener("input", apply);
    }
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        buttons.forEach(function (item) {
          item.classList.remove("active");
        });
        button.classList.add("active");
        apply();
      });
    });
    apply();
  }

  window.initMoviePlayer = function (videoId, buttonId, overlayId, url) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var overlay = document.getElementById(overlayId);
    if (!video || !overlay) {
      return;
    }
    var hls = null;
    var loaded = false;
    function attach() {
      if (loaded) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new Hls({ enableWorker: true });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
      loaded = true;
    }
    function start(event) {
      if (event) {
        event.preventDefault();
      }
      attach();
      overlay.classList.add("is-hidden");
      video.controls = true;
      var attempt = video.play();
      if (attempt && attempt.catch) {
        attempt.catch(function () {
          overlay.classList.remove("is-hidden");
        });
      }
    }
    overlay.addEventListener("click", start);
    if (button) {
      button.addEventListener("click", start);
    }
    video.addEventListener("play", function () {
      overlay.classList.add("is-hidden");
    });
    video.addEventListener("ended", function () {
      overlay.classList.remove("is-hidden");
    });
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  ready(function () {
    initMenu();
    initHero();
    initHeaderSearch();
    initFilters();
  });
})();
