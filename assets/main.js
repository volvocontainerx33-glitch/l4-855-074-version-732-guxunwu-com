(function () {
  function qs(selector, parent) {
    return (parent || document).querySelector(selector);
  }

  function qsa(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var button = qs('[data-menu-toggle]');
    var panel = qs('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var slider = qs('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = qsa('.hero-slide', slider);
    var dots = qsa('[data-hero-dot]', slider);
    var active = 0;
    var timer = null;

    function show(index) {
      active = index;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === active);
      });
    }

    function next() {
      show((active + 1) % slides.length);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        window.clearInterval(timer);
        timer = window.setInterval(next, 5000);
      });
    });

    if (slides.length > 1) {
      timer = window.setInterval(next, 5000);
    }
  }

  function setupSearchForms() {
    qsa('[data-site-search]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = qs('input[name="q"]', form);
        if (!input || !input.value.trim()) {
          event.preventDefault();
          return;
        }
      });
    });
  }

  function setupFilterPage() {
    var panel = qs('[data-filter-page]');
    var list = qs('[data-movie-list]');
    if (!panel || !list) {
      return;
    }
    var cards = qsa('[data-movie-card]', list);
    var search = qs('[data-filter-search]', panel);
    var category = qs('[data-filter-category]', panel);
    var region = qs('[data-filter-region]', panel);
    var year = qs('[data-filter-year]', panel);
    var sort = qs('[data-filter-sort]', panel);
    var result = qs('[data-filter-result]', panel);
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (search && initialQuery) {
      search.value = initialQuery;
    }

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function apply() {
      var query = normalize(search && search.value);
      var categoryValue = category ? category.value : 'all';
      var regionValue = region ? region.value : 'all';
      var yearValue = year ? year.value : 'all';
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-text'));
        var matchesQuery = !query || text.indexOf(query) >= 0;
        var matchesCategory = categoryValue === 'all' || card.getAttribute('data-site-category') === categoryValue;
        var matchesRegion = regionValue === 'all' || card.getAttribute('data-region') === regionValue;
        var matchesYear = yearValue === 'all' || card.getAttribute('data-year') === yearValue;
        var show = matchesQuery && matchesCategory && matchesRegion && matchesYear;
        card.classList.toggle('is-hidden', !show);
        if (show) {
          visible += 1;
        }
      });

      if (result) {
        result.textContent = '共显示 ' + visible + ' 部影片';
      }
    }

    function sortCards() {
      var mode = sort ? sort.value : 'default';
      var ordered = cards.slice();
      if (mode === 'year') {
        ordered.sort(function (a, b) {
          return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
        });
      }
      if (mode === 'title') {
        ordered.sort(function (a, b) {
          return String(a.getAttribute('data-title')).localeCompare(String(b.getAttribute('data-title')), 'zh-Hans-CN');
        });
      }
      ordered.forEach(function (card) {
        list.appendChild(card);
      });
      cards = qsa('[data-movie-card]', list);
      apply();
    }

    [search, category, region, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    if (sort) {
      sort.addEventListener('change', sortCards);
    }

    apply();
  }

  function setupPlayers() {
    qsa('.player-video[data-video-url]').forEach(function (video) {
      var source = video.getAttribute('data-video-url');
      var button = qs('.player-start');

      if (!source) {
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
      } else if (video.canPlayType('application/vnd.apple.mpegURL') || video.canPlayType('application/x-mpegURL')) {
        video.src = source;
      } else {
        video.src = source;
      }

      function hideButton() {
        if (button) {
          button.classList.add('is-hidden');
        }
      }

      function showButton() {
        if (button && video.paused) {
          button.classList.remove('is-hidden');
        }
      }

      if (button) {
        button.addEventListener('click', function () {
          var playback = video.play();
          if (playback && playback.catch) {
            playback.catch(function () {});
          }
          hideButton();
        });
      }

      video.addEventListener('play', hideButton);
      video.addEventListener('pause', showButton);
      video.addEventListener('ended', showButton);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupSearchForms();
    setupFilterPage();
    setupPlayers();
  });
})();
