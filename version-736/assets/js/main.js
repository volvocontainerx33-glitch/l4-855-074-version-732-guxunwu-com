(function () {
  const menuButton = document.querySelector("[data-menu-toggle]");
  const mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
  let activeSlide = 0;
  let slideTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === activeSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === activeSlide);
    });
  }

  if (slides.length) {
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
        if (slideTimer) {
          window.clearInterval(slideTimer);
        }
        slideTimer = window.setInterval(function () {
          showSlide(activeSlide + 1);
        }, 5200);
      });
    });

    showSlide(0);
    slideTimer = window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  const cardLists = Array.from(document.querySelectorAll("[data-card-list]"));

  cardLists.forEach(function (list) {
    const scope = list.closest("[data-filter-scope]") || document;
    const input = scope.querySelector("[data-card-search]");
    const yearSelect = scope.querySelector("[data-year-filter]");
    const cards = Array.from(list.querySelectorAll("[data-card]"));

    if (yearSelect) {
      const years = Array.from(new Set(cards.map(function (card) {
        return card.dataset.year || "";
      }).filter(Boolean))).sort().reverse();

      years.forEach(function (year) {
        const option = document.createElement("option");
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
      });
    }

    function applyFilters() {
      const keyword = input ? input.value.trim().toLowerCase() : "";
      const year = yearSelect ? yearSelect.value : "";

      cards.forEach(function (card) {
        const haystack = [
          card.dataset.title,
          card.dataset.tags,
          card.dataset.year,
          card.dataset.region,
          card.dataset.genre
        ].join(" ").toLowerCase();

        const matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        const matchYear = !year || card.dataset.year === year;

        card.classList.toggle("is-hidden-card", !(matchKeyword && matchYear));
      });
    }

    if (input) {
      input.addEventListener("input", applyFilters);
    }

    if (yearSelect) {
      yearSelect.addEventListener("change", applyFilters);
    }
  });

  const searchInput = document.querySelector("[data-site-search]");
  const searchResults = document.querySelector("[data-search-results]");

  if (searchInput && searchResults && Array.isArray(window.SEARCH_MOVIES)) {
    function renderSearch() {
      const keyword = searchInput.value.trim().toLowerCase();
      const results = window.SEARCH_MOVIES.filter(function (item) {
        if (!keyword) {
          return false;
        }

        return [
          item.title,
          item.description,
          item.tags,
          item.year,
          item.region,
          item.category
        ].join(" ").toLowerCase().indexOf(keyword) !== -1;
      }).slice(0, 80);

      if (!keyword) {
        searchResults.innerHTML = '<div class="empty-state">输入关键词后即可浏览匹配影片。</div>';
        return;
      }

      if (!results.length) {
        searchResults.innerHTML = '<div class="empty-state">没有找到匹配内容。</div>';
        return;
      }

      searchResults.innerHTML = results.map(function (item) {
        return [
          '<article class="movie-card">',
          '  <a class="poster-link" href="' + item.url + '">',
          '    <img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
          '    <span class="score-pill">' + escapeHtml(item.score) + ' 分</span>',
          '  </a>',
          '  <div class="card-body">',
          '    <div class="card-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.category) + '</span></div>',
          '    <h2><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h2>',
          '    <p>' + escapeHtml(item.description) + '</p>',
          '    <div class="tag-list"><span>' + escapeHtml(item.region) + '</span></div>',
          '  </div>',
          '</article>'
        ].join("");
      }).join("");
    }

    searchInput.addEventListener("input", renderSearch);
    renderSearch();
  }

  function escapeHtml(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
})();
