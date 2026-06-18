(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");

    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        menu.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var activeIndex = 0;

    function activateHero(index) {
      if (!slides.length) {
        return;
      }
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === activeIndex);
      });
    }

    if (slides.length) {
      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          activateHero(dotIndex);
        });
      });
      activateHero(0);
      window.setInterval(function () {
        activateHero(activeIndex + 1);
      }, 5600);
    }

    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var filterInputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));
    var emptyState = document.querySelector("[data-empty-state]");
    var status = document.querySelector("[data-filter-status]");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    function applyFilter(value) {
      var query = String(value || "").trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = card.getAttribute("data-search") || "";
        var matched = !query || haystack.indexOf(query) !== -1;
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });
      if (emptyState) {
        emptyState.classList.toggle("is-visible", visible === 0);
      }
      if (status) {
        status.textContent = query ? "找到 " + visible + " 个相关内容" : "输入关键词即可筛选片名、题材、地区与年份";
      }
    }

    if (filterInputs.length) {
      filterInputs.forEach(function (input) {
        if (initialQuery) {
          input.value = initialQuery;
        }
        input.addEventListener("input", function () {
          applyFilter(input.value);
        });
      });
      applyFilter(initialQuery);
    }

    Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(function (stage) {
      var video = stage.querySelector("video");
      var overlay = stage.querySelector("[data-play]");
      var source = video ? video.getAttribute("data-hls") : "";
      var hlsInstance = null;
      var started = false;

      function start() {
        if (!video || !source) {
          return;
        }
        if (!started) {
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
          } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
          } else {
            video.src = source;
          }
          started = true;
        }
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
        video.controls = true;
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            video.controls = true;
          });
        }
      }

      if (overlay) {
        overlay.addEventListener("click", start);
      }
      if (video) {
        video.addEventListener("click", function () {
          if (!started) {
            start();
          }
        });
        video.addEventListener("play", function () {
          if (overlay) {
            overlay.classList.add("is-hidden");
          }
        });
        window.addEventListener("beforeunload", function () {
          if (hlsInstance) {
            hlsInstance.destroy();
          }
        });
      }
    });
  });
})();
