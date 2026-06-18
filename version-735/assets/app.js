(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobileMenu = document.querySelector("[data-mobile-menu]");

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", function () {
      mobileMenu.classList.toggle("is-open");
    });
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function applyFilter(input) {
    var list = document.querySelector("[data-card-list]");
    if (!list) {
      return;
    }

    var query = normalize(input.value);
    var activeChip = document.querySelector("[data-chip-row] button.is-active");
    var chipValue = activeChip ? normalize(activeChip.getAttribute("data-chip")) : "";
    var cards = selectAll(".movie-card", list);

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-year"),
        card.getAttribute("data-type"),
        card.getAttribute("data-tags")
      ].join(" "));
      var matchText = !query || haystack.indexOf(query) !== -1;
      var matchChip = !chipValue || haystack.indexOf(chipValue) !== -1;
      card.classList.toggle("is-hidden", !(matchText && matchChip));
    });
  }

  selectAll("[data-card-filter]").forEach(function (input) {
    input.addEventListener("input", function () {
      applyFilter(input);
    });

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");
    if (query) {
      input.value = query;
      applyFilter(input);
    }
  });

  selectAll("[data-chip-row]").forEach(function (row) {
    row.addEventListener("click", function (event) {
      var button = event.target.closest("button[data-chip]");
      if (!button) {
        return;
      }

      selectAll("button[data-chip]", row).forEach(function (item) {
        item.classList.remove("is-active");
      });
      button.classList.add("is-active");

      var input = document.querySelector("[data-card-filter]");
      if (input) {
        applyFilter(input);
      }
    });
  });

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = selectAll("[data-hero-slide]", hero);
    var dots = selectAll("[data-hero-dot]", hero);
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function startAuto() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(current - 1);
        startAuto();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
        startAuto();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        startAuto();
      });
    });

    startAuto();
  }
})();
