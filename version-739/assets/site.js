(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
      return;
    }
    callback();
  }

  function setupMenu() {
    var toggle = document.querySelector('.menu-toggle');
    var menu = document.getElementById('mobile-menu');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5500);
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
    panels.forEach(function (panel) {
      var section = panel.closest('.filter-section');
      if (!section) {
        return;
      }
      var search = panel.querySelector('[data-page-search]');
      var year = panel.querySelector('[data-filter-year]');
      var chips = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-type]'));
      var cards = Array.prototype.slice.call(section.querySelectorAll('[data-movie-card]'));
      var selectedType = 'all';

      function apply() {
        var query = search ? search.value.trim().toLowerCase() : '';
        var selectedYear = year ? year.value : 'all';
        cards.forEach(function (card) {
          var text = (card.getAttribute('data-keywords') || '').toLowerCase();
          var type = card.getAttribute('data-type') || '';
          var cardYear = card.getAttribute('data-year') || '';
          var matchText = !query || text.indexOf(query) !== -1;
          var matchType = selectedType === 'all' || type === selectedType;
          var matchYear = selectedYear === 'all' || cardYear === selectedYear;
          card.classList.toggle('is-hidden', !(matchText && matchType && matchYear));
        });
      }

      if (search) {
        search.addEventListener('input', apply);
      }
      if (year) {
        year.addEventListener('change', apply);
      }
      chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
          chips.forEach(function (item) {
            item.classList.remove('is-active');
          });
          chip.classList.add('is-active');
          selectedType = chip.getAttribute('data-filter-type') || 'all';
          apply();
        });
      });
    });
  }

  function cardHtml(movie) {
    var tags = movie.tags.slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return [
      '<article class="movie-card">',
      '  <a class="movie-poster" href="./' + movie.file + '" aria-label="' + escapeHtml(movie.title) + ' 在线观看">',
      '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="poster-badge">' + escapeHtml(movie.type || '影片') + '</span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <div class="movie-tags">' + tags + '</div>',
      '    <h3><a href="./' + movie.file + '">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p>' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="movie-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span></div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function setupSearchPage() {
    var input = document.getElementById('search-input');
    var results = document.getElementById('search-results');
    var title = document.getElementById('search-title');
    var hint = document.getElementById('search-hint');
    if (!input || !results || !window.SEARCH_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    input.value = query;

    function run() {
      var term = input.value.trim().toLowerCase();
      if (!term) {
        results.innerHTML = '';
        if (title) {
          title.textContent = '搜索结果';
        }
        if (hint) {
          hint.textContent = '输入关键词后即可浏览匹配影片。';
        }
        return;
      }
      var matches = window.SEARCH_MOVIES.filter(function (movie) {
        return movie.searchText.indexOf(term) !== -1;
      }).slice(0, 120);
      if (title) {
        title.textContent = '“' + input.value.trim() + '” 的搜索结果';
      }
      if (hint) {
        hint.textContent = matches.length ? '已为你筛选出相关影片。' : '未找到相关影片，可尝试更换关键词。';
      }
      results.innerHTML = matches.map(cardHtml).join('');
    }

    input.addEventListener('input', run);
    run();
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupSearchPage();
  });
})();
