/* Tiyi marketing site — main.js
 * Progressive enhancements:
 *  - Theme toggle (dark / light) with localStorage persistence
 *  - Screenshot src swap based on (page locale, theme)
 *  - Copy-to-clipboard
 *  - Reveal-on-scroll
 *  - Year stamp
 *  - Docs sidebar active link + auto-built TOC + scrollspy
 *
 * The early <head> inline script in every HTML page sets
 * document.documentElement.dataset.theme before paint. This file
 * runs after layout, so it can safely manipulate the DOM and
 * subscribe to interactions.
 */

(function () {
  'use strict';

  // ---------- Theme state ----------
  var THEME_KEY = 'tiyi:theme';

  function getTheme() {
    return document.documentElement.dataset.theme || 'dark';
  }

  function setTheme(t) {
    if (t !== 'dark' && t !== 'light') t = 'dark';
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem(THEME_KEY, t); } catch (e) {}
    swapScreenshots();
    // Tell anyone who cares (e.g. third-party widgets) the theme changed.
    document.dispatchEvent(new CustomEvent('tiyi:theme', { detail: { theme: t } }));
  }

  // Page locale is set by <html lang="..."> on every file.
  function getLocale() {
    var lang = (document.documentElement.lang || 'en').toLowerCase();
    return lang.indexOf('zh') === 0 ? 'zh' : 'en';
  }

  // ---------- Screenshot src swap ----------
  // Each <img data-shot="dashboard"> picks its src from
  // {assetsBase}/screenshots/{locale}-{theme}/{shot}.png
  // The assets base is on <body data-assets-base="..."> so each
  // file (root, /docs/, /zh/, /zh/docs/) resolves to the correct path.
  function swapScreenshots() {
    var base = document.body && document.body.dataset.assetsBase
               ? document.body.dataset.assetsBase
               : 'assets/img/';
    var locale = getLocale();
    var theme = getTheme();
    var dir = base + 'screenshots/' + locale + '-' + theme + '/';
    document.querySelectorAll('img[data-shot]').forEach(function (img) {
      var shot = img.dataset.shot;
      if (!shot) return;
      var src = dir + shot + '.png';
      if (img.getAttribute('src') !== src) {
        img.setAttribute('src', src);
      }
    });
  }

  // ---------- Theme toggle button ----------
  function bindThemeToggle() {
    document.querySelectorAll('[data-action="toggle-theme"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setTheme(getTheme() === 'dark' ? 'light' : 'dark');
      });
    });
  }

  // ---------- Year stamp ----------
  var yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------- Copy buttons ----------
  document.querySelectorAll('button.copy[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', async function () {
      var text = btn.getAttribute('data-copy') || '';
      try {
        await navigator.clipboard.writeText(text);
      } catch (e) {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (_) {}
        document.body.removeChild(ta);
      }
      var original = btn.textContent;
      var copiedLabel = btn.getAttribute('data-copied') || 'copied';
      btn.textContent = copiedLabel;
      btn.classList.add('copied');
      setTimeout(function () {
        btn.textContent = original;
        btn.classList.remove('copied');
      }, 1400);
    });
  });

  // ---------- Reveal on scroll ----------
  var reveals = document.querySelectorAll('.reveal');
  if (reveals.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  }
  // Hard backstop: always reveal after 1.5s.
  setTimeout(function () {
    document.querySelectorAll('.reveal:not(.in)').forEach(function (el) { el.classList.add('in'); });
  }, 1500);

  // ---------- Docs-only enhancements ----------
  if (document.body.classList.contains('docs')) {
    // Sidebar active link
    var here = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.docs-nav-group a[href]').forEach(function (a) {
      var target = a.getAttribute('href');
      if (target && (target === here || (here === '' && target === 'index.html'))) {
        a.classList.add('active');
      }
    });

    // Auto-build TOC from h2[id]/h3[id] inside .docs-content
    var tocRoot = document.getElementById('docs-toc');
    var content = document.querySelector('.docs-content');
    if (tocRoot && content) {
      var ul = document.createElement('ul');
      var headings = content.querySelectorAll('h2[id], h3[id]');
      headings.forEach(function (h) {
        var li = document.createElement('li');
        li.className = h.tagName === 'H3' ? 'lvl-3' : 'lvl-2';
        var a = document.createElement('a');
        a.href = '#' + h.id;
        a.textContent = h.textContent.replace(/#$/, '').trim();
        li.appendChild(a);
        ul.appendChild(li);

        if (!h.querySelector('.anchor')) {
          var link = document.createElement('a');
          link.href = '#' + h.id;
          link.className = 'anchor';
          link.textContent = '#';
          link.setAttribute('aria-hidden', 'true');
          h.appendChild(document.createTextNode(' '));
          h.appendChild(link);
        }
      });
      if (ul.children.length) {
        tocRoot.appendChild(ul);
      } else {
        tocRoot.style.display = 'none';
      }

      // Scrollspy
      var tocLinks = tocRoot.querySelectorAll('a');
      var linkById = new Map();
      tocLinks.forEach(function (a) { linkById.set(a.getAttribute('href').slice(1), a); });
      if ('IntersectionObserver' in window && headings.length) {
        var spy = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              tocLinks.forEach(function (a) { a.classList.remove('active'); });
              var link = linkById.get(entry.target.id);
              if (link) link.classList.add('active');
            }
          });
        }, { rootMargin: '-80px 0px -70% 0px', threshold: 0 });
        headings.forEach(function (h) { spy.observe(h); });
      }
    }
  }

  // ---------- Wire things up ----------
  bindThemeToggle();
  swapScreenshots();
})();
