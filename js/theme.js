// Light/dark toggle. Light is the default; the choice is remembered.
(function () {
  var KEY = 'learn_gitlab_theme';
  function apply(t) {
    document.documentElement.dataset.theme = t;
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute('content', t === 'dark' ? '#0a0a0a' : '#ffffff');
    document.querySelectorAll('[data-theme-toggle]').forEach(function (b) {
      var next = t === 'dark' ? 'light' : 'dark';
      b.setAttribute('aria-label', 'Switch to ' + next + ' mode');
      b.textContent = b.classList.contains('theme-toggle-wide') ? (t === 'dark' ? '☀ Light mode' : '☾ Dark mode') : (t === 'dark' ? '☀' : '☾');
    });
  }
  var cur = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
  apply(cur);
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-theme-toggle]');
    if (!b) return;
    cur = cur === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem(KEY, cur); } catch (err) {}
    apply(cur);
  });
})();
